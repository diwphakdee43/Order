document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');

    const renderProducts = async () => {
        productList.innerHTML = '';
        const allProducts = await db.products.toArray();
        allProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-item';
            item.innerHTML = `
                <span>${product.name} - ${product.price.toFixed(2)} บาท</span>
                <button class="delete-btn" data-id="${product.id}">ลบ</button>
            `;
            productList.appendChild(item);
        });
    };

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        await db.products.add({ name, price });
        productForm.reset();
        await renderProducts();
    });

    productList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            await db.products.delete(id);
            await renderProducts();
        }
    });
    
    renderProducts();
});