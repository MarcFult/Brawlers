import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Shop.css';

const skinNames = ['pepe', 'Peter_H', 'ralph', 'fox', 'caretaker', 'alien'];
const ITEMS_PER_PAGE = 9;

const Shop = () => {
    const navigate = useNavigate();
    const { state } = useLocation() as { state?: { userId?: number } };

    let initialUserId = state?.userId ?? null;
    if (!initialUserId) {
        const stored = localStorage.getItem('userId');
        if (stored) {
            initialUserId = parseInt(stored, 10);
        }
    }

    const [userId, setUserId] = useState<number | null>(initialUserId);
    const [balance, setBalance] = useState(0);
    const [ownedItems, setOwnedItems] = useState<string[]>([]);
    const [showPurchasePopup, setShowPurchasePopup] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userId !== null) {
            localStorage.setItem('userId', userId.toString());
        }
    }, [userId]);

    useEffect(() => {
        if (userId === null) {
            alert('Kein User-ID gefunden. Sie werden zurück zur Startseite geleitet.');
            navigate('/', { replace: true });
            return;
        }

        const fetchPlayerData = async () => {
            try {
                setIsLoading(true);
                const [playerRes, itemsRes] = await Promise.all([
                    fetch(`http://localhost:8080/players/user/${userId}`, {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    }),
                    fetch(`http://localhost:8080/players/user/${userId}/gameObjects`, {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    })
                ]);

                if (!playerRes.ok || !itemsRes.ok) throw new Error('Failed to fetch player data');

                const [playerData, items] = await Promise.all([
                    playerRes.json(),
                    itemsRes.json()
                ]);

                setBalance(playerData.ects);
                setOwnedItems(items);
            } catch (error) {
                console.error('Error fetching player data:', error);
                alert('Failed to load player data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlayerData();
    }, [userId, navigate]);

    useEffect(() => {
        const newECTS = localStorage.getItem('newECTS');
        if (newECTS && userId !== null) {
            localStorage.removeItem('newECTS');
            const amount = parseInt(newECTS, 10); // parseInt to ensure it's a number
            if (!isNaN(amount) && amount > 0) {
                handleBuyCoins(amount);
            }
        }
    }, [userId]);

    const items = skinNames.map((skinName, index) => ({
        id: index + 1,
        name: skinName,
        sprite: `src/assets/char/${skinName}_left.png`,
        price: 100 + (index % 3) * 50,
        rarity: ['common', 'rare', 'epic', 'legendary'][index % 4],
    }));

    const handleItemClick = async (item: typeof items[0]) => {
        if (!userId) return;

        if (ownedItems.includes(item.name)) {
            alert(`You already own ${item.name}!`);
            return;
        }
        if (balance < item.price) {
            alert('Nicht genügend ECTS. Bitte kaufen Sie zuerst ECTS.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/players/user/${userId}/purchase`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ objectName: item.name, cost: item.price }),
            });

            if (!response.ok) throw new Error('Purchase failed');

            const [updatedPlayer, updatedItems] = await Promise.all([
                response.json(),
                fetch(`http://localhost:8080/players/user/${userId}/gameObjects`, {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                }).then(res => res.json())
            ]);

            setBalance(updatedPlayer.ects);
            setOwnedItems(updatedItems);
            setPurchasedItem(item);
            setShowPurchasePopup(true);
        } catch (error: any) {
            console.error('Purchase failed:', error);
            alert(error.message || 'Purchase failed');
        }
    };

    const handleBuyCoins = async (amount: number) => {
        if (!userId) return;

        try {
            const response = await fetch(`http://localhost:8080/players/user/${userId}/buy-ects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ amount: parseInt(amount.toString(), 10) }), //  force integer
            });

            if (!response.ok) throw new Error('ECTS-Kauf fehlgeschlagen');

            const updatedPlayer = await response.json();
            setBalance(updatedPlayer.ects);
        } catch (error: any) {
            console.error('Fehler beim Kauf von ECTS:', error);
            alert(error.message || 'Kauf fehlgeschlagen');
        }
    };

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const currentItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 0 && page < totalPages) setCurrentPage(page);
    };

    if (isLoading) return <div className="shop-loading">Loading...</div>;

    return (
        <div className="shop-container">
            <div className="shop-header">
                <div className="balance-display">{balance}</div>
            </div>

            <button className="buy-dollar-button" onClick={() => {
                if (userId !== null) {
                    localStorage.setItem('userId', userId.toString());
                    window.location.href = "src/shop/buy-ects.html"; //  Public path
                }
            }}>
                Buy $
            </button>

            <div className="shop-grid">
                {currentItems.map((item) => (
                    <div
                        key={item.id}
                        className={`shop-item ${ownedItems.includes(item.name) ? 'owned' : ''}`}
                        onClick={() => handleItemClick(item)}
                    >
                        <img
                            src={item.sprite}
                            alt={item.name}
                            className="shop-item-sprite"
                        />
                        <div className="shop-item-price">{item.price} ECTS</div>
                        {ownedItems.includes(item.name) && (
                            <div className="shop-item-owned">OWNED</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="page-buttons-vertical">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        className={i === currentPage ? 'active' : ''}
                        onClick={() => goToPage(i)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {showPurchasePopup && purchasedItem && (
                <div className="purchase-popup">
                    <h2>Purchased {purchasedItem.name}!</h2>
                    <img src={purchasedItem.sprite} alt={purchasedItem.name} />
                    <button onClick={() => setShowPurchasePopup(false)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Shop;
