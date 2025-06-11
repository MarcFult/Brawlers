import React, { useState, useEffect } from 'react';
import './Shop.css';

const skinNames = ['pepe', 'Peter_H', 'ralph', 'fox', 'caretaker', 'alien'];
const ITEMS_PER_PAGE = 9;

const Shop = ({ userId }) => {
    const [balance, setBalance] = useState(0);
    const [ownedItems, setOwnedItems] = useState([]);
    const [showPurchasePopup, setShowPurchasePopup] = useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setIsLoading(true);
                const playerRes = await fetch(`/players/user/${userId}`);
                const playerData = await playerRes.json();
                setBalance(playerData.ects);

                const itemsRes = await fetch(`/players/user/${userId}/gameObjects`);
                const items = await itemsRes.json();
                setOwnedItems(items);
            } catch (error) {
                console.error("Error fetching player data:", error);
                alert("Failed to load player data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlayerData();
    }, [userId]);

    const items = skinNames.map((skinName, index) => ({
        id: index + 1,
        name: skinName,
        sprite: `/assets/char/${skinName}_left.png`,
        price: 100 + (index % 3) * 50,
        rarity: ['common', 'rare', 'epic', 'legendary'][index % 4]
    }));

    const handleItemClick = async (item) => {
        if (ownedItems.includes(item.name)) {
            alert(`You already own ${item.name}!`);
            return;
        }
        if (balance < item.price) {
            alert(`You need ${item.price - balance} more ECTS!`);
            return;
        }
        try {
            const response = await fetch(`/players/user/${userId}/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ objectName: item.name, cost: item.price })
            });
            if (!response.ok) throw new Error('Purchase failed');
            const updatedPlayer = await response.json();
            const ownedItemsRes = await fetch(`/players/user/${userId}/gameObjects`);
            const updatedItems = await ownedItemsRes.json();
            setBalance(updatedPlayer.ects);
            setOwnedItems(updatedItems);
            setPurchasedItem(item);
            setShowPurchasePopup(true);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert(error.message);
        }
    };
    //Dummy Implementierung
    const handleBuyCoins = async (amount) => {
        console.log(`Simulierter Kauf von ${amount} ECTS`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake-Ladezeit
        setBalance(prev => prev + amount);
        alert(`DEBUG: ${amount} ECTS hinzugefügt!`);
        setShowPaymentPopup(false);
    };


    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const currentItems = items.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const goToPage = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    if (isLoading) return <div className="shop-loading">Loading...</div>;

    return (
        <div className="shop-container">
            <img src="/assets/Shop.png" alt="Shop" className="shop-background"/>

            {/* Invisible Item Buttons */}
            <div className="interactive-overlay">
                {currentItems.map((item, index) => (
                    <button
                        key={item.id}
                        className="invisible-button"
                        style={{
                            position: 'absolute',
                            left: `${10 + (index % 3) * 30}%`,
                            top: `${20 + Math.floor(index / 3) * 25}%`,
                            width: '15%',
                            height: '20%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                        onClick={() => handleItemClick(item)}
                    />
                ))}
            </div>

            {/* Side Page Numbers */}
            <div className="page-buttons-vertical">
                {Array.from({length: totalPages}).map((_, i) => (
                    <button
                        key={i}
                        className={i === currentPage ? 'active' : ''}
                        onClick={() => goToPage(i)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Buy $ Button */}
            <button
                className="buy-dollar-button"
                onClick={() => window.location.href = "/buy-ects.html"}
            >
                Buy $
            </button>


            {/* Balance Display */}
            <div className="balance-display">
                🪙 {balance} ECTS
            </div>

            {/* Popups */}
            {showPurchasePopup && (
                <div className="purchase-popup">
                    <h2>Purchased {purchasedItem.name}!</h2>
                    <img src={purchasedItem.sprite} alt={purchasedItem.name}/>
                    <button onClick={() => setShowPurchasePopup(false)}>Close</button>
                </div>
            )}

            // Payment-Popup mit einfachen Buttons
            {showPaymentPopup && (
                <div className="payment-popup">
                    <h2>ECTS kaufen (DEMO)</h2>
                    <div className="dummy-options">
                        {[100, 300, 500].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleBuyCoins(amount)}
                            >
                                {amount} ECTS
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowPaymentPopup(false)}>Abbrechen</button>
                </div>
            )}
        </div>
    );
};

export default Shop;