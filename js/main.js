document.addEventListener('DOMContentLoaded', () => {
    const orderList = document.getElementById('order-list');
    const calendarDiv = document.getElementById('calendar');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    
    let currentDate = new Date();

    // --- CALENDAR LOGIC ---
    const renderCalendar = async () => {
        calendarDiv.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.textContent = new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: 'long' }).format(currentDate);

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();

        // Get delivery dates for the current month
        const pendingOrders = await db.orders.where('status').equals('new').toArray();
        const deliveryDates = new Set(pendingOrders.map(o => o.deliveryDate.substring(0, 10))); // YYYY-MM-DD

        // Day names header
        ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].forEach(day => {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.className = 'calendar-day-name';
            dayNameDiv.textContent = day;
            calendarDiv.appendChild(dayNameDiv);
        });

        // Blank days for start of month
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarDiv.appendChild(document.createElement('div'));
        }

        // Days of month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (deliveryDates.has(dateStr)) {
                dayDiv.classList.add('has-delivery');
            }
            calendarDiv.appendChild(dayDiv);
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- ORDER LIST LOGIC ---
    const renderOrders = async () => {
        // ... (copy renderOrders and its click listener logic from the previous app.js) ...
        orderList.innerHTML = '';
        const allOrders = await db.orders.orderBy('id').reverse().toArray();
        
        if (allOrders.length === 0) {
            orderList.innerHTML = '<p>ยังไม่มีออเดอร์...</p>';
            return;
        }

        allOrders.forEach(order => {
            const orderItemDiv = document.createElement('div');
            orderItemDiv.className = `order-item ${order.status}`;
            const itemsHtml = order.items.map(item => `<li>${item.quantity} x ${item.name}</li>`).join('');
            const deliveryDate = new Date(order.deliveryDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

            orderItemDiv.innerHTML = `
                <div class="order-item-header">
                    <div>
                        <strong>ลูกค้า: ${order.customerInfo}</strong>
                        <p>ที่อยู่: ${order.address} | ส่งวันที่: ${deliveryDate}</p>
                    </div>
                    ${order.status === 'new' ? `<button class="close-btn" data-id="${order.id}">ปิดงาน</button>` : '<span>จัดส่งแล้ว</span>'}
                </div>
                <div class="order-item-details">
                    <ul>${itemsHtml}</ul>
                    <h4>ยอดรวม: ${order.totalAmount.toFixed(2)} บาท</h4>
                </div>
            `;
            orderList.appendChild(orderItemDiv);
        });
    };
    
    orderList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('close-btn')) {
            const id = parseInt(e.target.dataset.id);
            await db.orders.update(id, { status: 'completed' });
            await renderOrders();
            await renderCalendar(); // Re-render calendar to remove highlight
        }
    });

    // --- INITIAL LOAD ---
    const initializeApp = async () => {
        await renderCalendar();
        await renderOrders();
    };

    initializeApp();
});