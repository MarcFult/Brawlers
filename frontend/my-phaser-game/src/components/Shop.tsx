import React, { useState, useEffect } from 'react';
import './Shop.css';

//TODO Alien und cop rein tun und ects kaufen
const skinNames = ['pepe','Peter_H', 'ralph', 'caretaker'];
const ITEMS_PER_PAGE = 6;

const Shop = ({ userId }) => {
    const [balance, setBalance] = useState(0);
    const [ownedItems, setOwnedItems] = useState([]);
    const [showPurchasePopup, setShowPurchasePopup] = useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        amount: 100
    });

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
                body: JSON.stringify({
                    objectName: item.name,
                    cost: item.price
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Purchase failed');
            }

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

    const handleBuyCoins = async () => {
        try {
            const response = await fetch(`/players/user/${userId}/add-ects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: cardDetails.amount })
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            const updatedPlayer = await response.json();
            setBalance(updatedPlayer.ects);  //Gibt kein update player
            alert(`Successfully added ${cardDetails.amount} ECTS!`);
            setShowPaymentPopup(false);
        } catch (error) {
            console.error('Payment failed:', error);
            alert(error.message);
        }
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const closePopup = () => setShowPurchasePopup(false);

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

    if (isLoading) {
        return <div className="shop-loading">Loading player data...</div>;
    }

    return (
        <div className="shop vending-layout">
            <div className="balance-display">
                <span className="coin-icon">🪙</span>
                <span className="balance-amount">{balance} ECTS</span>
            </div>

            <h1>Brawlers Vending Machine</h1>

            <div className="shop-content">
                <div className="items-grid">
                    {currentItems.map((item) => (
                        <div
                            key={item.id}
                            className={`shop-item ${ownedItems.includes(item.name) ? 'owned' : ''}`}
                            onClick={() => !ownedItems.includes(item.name) && handleItemClick(item)}
                        >
                            <div className="sprite-container">
                                <img src={item.sprite} alt={item.name} className="sprite-image" />
                                {ownedItems.includes(item.name) && (
                                    <div className="owned-badge">OWNED</div>
                                )}
                                <div className={`rarity-badge ${item.rarity}`}>
                                    {item.rarity.toUpperCase()}
                                </div>
                            </div>
                            <h3>{item.name}</h3>
                            <p>{item.price} ECTS</p>
                            {!ownedItems.includes(item.name) && (
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item);
                                }}>
                                    Buy
                                </button>
                            )}
                        </div>
                    ))}
                </div>

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

                <div className="buy-coins-section">
                    <button className="buy-coins-button" onClick={() => setShowPaymentPopup(true)}>
                        🪙 ECTS kaufen
                    </button>
                </div>
            </div>

            {showPurchasePopup && (
                <div className="purchase-popup">
                    <div className="popup-content">
                        <h2>Kauf erfolgreich!</h2>
                        <div className="purchased-sprite">
                            <img src={purchasedItem.sprite} alt={purchasedItem.name} />
                        </div>
                        <p>Du hast <strong>{purchasedItem.name}</strong> gekauft!</p>
                        <div className="popup-buttons">
                            <button onClick={closePopup}>Zurück zum Shop</button>
                            <button
                                className="buy-more-button"
                                onClick={() => {
                                    closePopup();
                                    setShowPaymentPopup(true);
                                }}
                            >
                                Mehr ECTS kaufen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPaymentPopup && (
                <div className="payment-popup">
                    <div className="popup-content">
                        <h2>ECTS kaufen</h2>
                        <div className="payment-form">
                            <div className="form-group">
                                <label>Kartennummer</label>
                                <input
                                    type="text"
                                    name="number"
                                    value={cardDetails.number}
                                    onChange={handleCardInputChange}
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ablaufdatum</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        value={cardDetails.expiry}
                                        onChange={handleCardInputChange}
                                        placeholder="MM/JJ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleCardInputChange}
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>ECTS Menge</label>
                                <select
                                    name="amount"
                                    value={cardDetails.amount}
                                    onChange={handleCardInputChange}
                                >
                                    <option value="100">100 ECTS - €1.99</option>
                                    <option value="300">300 ECTS - €4.99</option>
                                    <option value="500">500 ECTS - €7.99</option>
                                    <option value="1000">1000 ECTS - €12.99</option>
                                </select>
                            </div>
                        </div>
                        <div className="popup-buttons">
                            <button onClick={() => setShowPaymentPopup(false)}>Abbrechen</button>
                            <button className="confirm-payment" onClick={handleBuyCoins}>
                                Kaufen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
