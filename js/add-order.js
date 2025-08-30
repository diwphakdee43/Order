// js/add-order.js
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const orderForm = document.getElementById('order-form');
    const productSelect = document.getElementById('product-select');
    const addItemBtn = document.getElementById('add-item-btn');
    const currentOrderItemsDiv = document.getElementById('current-order-items');
    const otherCostsInput = document.getElementById('otherCosts');

    // --- STATE VARIABLE ---
    // array นี้จะเก็บสินค้าที่ถูกเพิ่มเข้ามาในออเดอร์ปัจจุบันชั่วคราว
    let currentOrderItems = []; 

    // --- FUNCTIONS ---

    // ดึงสินค้าทั้งหมดจาก DB มาใส่ใน dropdown
    const populateProductDropdown = async () => {
        productSelect.innerHTML = '';
        const allProducts = await db.products.toArray();
        if(allProducts.length === 0) {
            productSelect.innerHTML = '<option disabled selected>กรุณาเพิ่มสินค้าก่อน</option>';
            addItemBtn.disabled = true;
        } else {
            allProducts.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.name} (${p.price.toFixed(2)} บาท)`;
                option.dataset.price = p.price;
                option.dataset.name = p.name;
                productSelect.appendChild(option);
            });
            addItemBtn.disabled = false;
        }
    };

    // คำนวณราคารวมและอัปเดตหน้าจอ
    const updateOrderSummary = () => {
        const subtotal = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const otherCosts = parseFloat(otherCostsInput.value) || 0;
        const total = subtotal + otherCosts;

        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('total-amount').textContent = total.toFixed(2);
    };

    // แสดงรายการสินค้าที่อยู่ในตะกร้าปัจจุบัน
    const renderCurrentOrderItems = () => {
        currentOrderItemsDiv.innerHTML = '';
        if (currentOrderItems.length === 0) {
            currentOrderItemsDiv.innerHTML = '<p>ยังไม่มีรายการสินค้า...</p>';
        } else {
            const list = document.createElement('ul');
            currentOrderItems.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.quantity} x ${item.name} @ ${item.price.toFixed(2)} บาท`;
                list.appendChild(listItem);
            });
            currentOrderItemsDiv.appendChild(list);
        }
        updateOrderSummary();
    };

    // --- EVENT LISTENERS ---

    // **ส่วนสำคัญ: เมื่อกดปุ่ม "เพิ่มรายการ"**
    addItemBtn.addEventListener('click', () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value) return; 

        const productId = parseInt(selectedOption.value);
        const name = selectedOption.dataset.name;
        const price = parseFloat(selectedOption.dataset.price);
        const quantity = parseInt(document.getElementById('quantity').value);

        if (quantity < 1) {
            alert('จำนวนต้องมากกว่า 0');
            return;
        }

        const existingItem = currentOrderItems.find(item => item.productId === productId);
        
        if (existingItem) {
            // ถ้ามีสินค้านี้ในตะกร้าแล้ว ให้อัปเดตจำนวน
            existingItem.quantity += quantity;
        } else {
            // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
            currentOrderItems.push({ productId, name, price, quantity });
        }
        
        // อัปเดตการแสดงผล
        renderCurrentOrderItems();
    });
    
    // เมื่อมีการเปลี่ยนแปลงค่าใช้จ่ายอื่น ให้คำนวณใหม่
    otherCostsInput.addEventListener('input', updateOrderSummary);

    // เมื่อกด "บันทึกออเดอร์"
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentOrderItems.length === 0) {
            alert('กรุณาเพิ่มรายการสินค้าในออเดอร์ก่อน');
            return;
        }

        const subtotal = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const otherCosts = parseFloat(otherCostsInput.value) || 0;
        
        await db.orders.add({
            customerInfo: document.getElementById('customerInfo').value,
            address: document.getElementById('address').value,
            deliveryDate: document.getElementById('deliveryDate').value,
            items: currentOrderItems,
            otherCosts: otherCosts,
            totalAmount: subtotal + otherCosts,
            status: 'new'
        });

        alert('บันทึกออเดอร์เรียบร้อยแล้ว!');
        window.location.href = 'index.html'; // กลับไปหน้าหลัก
    });

    // --- INITIAL LOAD ---
    const initializeForm = async () => {
        await populateProductDropdown();
        renderCurrentOrderItems();
    };
    
    initializeForm();
});