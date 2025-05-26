import React, { useState } from 'react';
import './Shop.css';

// Array mit den Skin-Namen (Dateinamen ohne _left.png)
const skinNames = [
    'pepe',
    'Peter_H',
    'ralph',
    'caretaker'
];

const ITEMS_PER_PAGE = 6;

const Shop = () => {
    const [balance] = useState(500);
    const [showPurchasePopup, setShowPurchasePopup] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);


    const items = skinNames.map((skinName, index) => ({
        id: index + 1,
        name: skinName,
        sprite: `/assets/char/${skinName}_left.png`,
        price: 100 + (index % 3) * 50, // Beispielpreis
    }));

    const handleItemClick = (item) => {
        if (balance >= item.price) {
            setPurchasedItem(item);
            setShowPurchasePopup(true);
        } else {
            alert(`Du benötigst noch ${item.price - balance} Münzen mehr!`);
        }
    };

    const closePopup = () => {
        setShowPurchasePopup(false);
    };

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const currentItems = items.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    const goToPage = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="shop vending-layout">
            {/* Geldanzeige */}
            <div className="balance-display">
                <span className="coin-icon">🪙</span>
                <span className="balance-amount">{balance}</span>
            </div>

            <h1>Brawlers Vending Machine</h1>

            <div className="shop-content">
                {/* Grid mit 6 Items */}
                <div className="items-grid">
                    {currentItems.map((item) => (
                        <div
                            key={item.id}
                            className="shop-item"
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="sprite-container">
                                <img
                                    src={item.sprite}
                                    alt={item.name}
                                    className="sprite-image"
                                />
                            </div>
                            <h3>{item.name}</h3>
                            <p>{item.price} coins</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item);
                                }}
                            >
                                Buy
                            </button>
                        </div>
                    ))}
                </div>

                {/* Seitenwechsel-Buttons */}
                <div className="button-panel">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            className={`page-button ${i === currentPage ? 'active' : ''}`}
                            onClick={() => goToPage(i)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kauf-Popup */}
            {showPurchasePopup && (
                <div className="purchase-popup">
                    <div className="popup-content">
                        <h2>Kauf erfolgreich!</h2>
                        <div className="purchased-sprite">
                            <img src={purchasedItem.sprite} alt={purchasedItem.name} />
                        </div>
                        <p>Du hast <strong>{purchasedItem.name}</strong> gekauft!</p>
                        <button onClick={closePopup}>Zurück zum Shop</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
