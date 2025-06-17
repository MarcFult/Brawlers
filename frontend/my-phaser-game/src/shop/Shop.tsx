import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Shop.css';

const skinNames = ['pepe', 'Peter_H', 'ralph', 'fox', 'caretaker', 'alien'];
const maps = ['third_map', 'ah', 'fourth_map'];
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
                const [playerRes, gameObjectsRes, levelsRes] = await Promise.all([
                    fetch(`http://localhost:8080/players/user/${userId}`, {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    }),
                    fetch(`http://localhost:8080/players/user/${userId}/gameObjects`, {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    }),
                    fetch(`http://localhost:8080/players/user/${userId}/levels`, {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    }),
                ]);

                if (!playerRes.ok || !gameObjectsRes.ok || !levelsRes.ok) {
                    throw new Error('Failed to fetch player data');
                }

                const [playerData, gameObjects, levels] = await Promise.all([
                    playerRes.json(),
                    gameObjectsRes.json(),
                    levelsRes.json(),
                ]);

                setBalance(playerData.ects);
                setOwnedItems([...gameObjects, ...levels]);
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
            const amount = parseInt(newECTS, 10);
            if (!isNaN(amount) && amount > 0) {
                handleBuyCoins(amount);
            }
        }
    }, [userId]);

    useEffect(() => {
        const ectsUpdated = localStorage.getItem('ectsUpdated');
        if (ectsUpdated === 'true' && userId !== null) {
            localStorage.removeItem('ectsUpdated');
            fetch(`http://localhost:8080/players/user/${userId}`, {
                credentials: 'include',
                headers: { Accept: 'application/json' },
            })
                .then(res => res.json())
                .then(data => setBalance(data.ects))
                .catch(err => console.error('Fehler beim ECTS-Update:', err));
        }
    }, [userId]);


    const skinItems = skinNames.map((skinName, index) => ({
        id: index + 1,
        name: skinName,
        sprite: `src/assets/char/${skinName}_left.png`,
        price: 100 + (index % 3) * 50,
        type: 'skin',
    }));

    const mapItems = maps.map((mapName, index) => ({
        id: 100 + index,
        name: mapName,
        sprite: `src/assets/${mapName}.png`,
        price: 10 + index * 10,
        type: 'level',
    }));

    const allItems = [...skinItems, ...mapItems];

    const handleItemClick = async (item: typeof allItems[0]) => {
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
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    objectName: item.name,
                    cost: item.price,
                }),
            });

            if (!response.ok) throw new Error('Purchase failed');

            const [updatedPlayer, updatedGameObjects, updatedLevels] = await Promise.all([
                fetch(`http://localhost:8080/players/user/${userId}`, {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                }).then(res => res.json()),
                fetch(`http://localhost:8080/players/user/${userId}/gameObjects`, {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                }).then(res => res.json()),
                fetch(`http://localhost:8080/players/user/${userId}/levels`, {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                }).then(res => res.json()),
            ]);

            setBalance(updatedPlayer.ects);
            setOwnedItems([...updatedGameObjects, ...updatedLevels]);
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
            const response = await fetch(`http://localhost:8080/players/user/${userId}/buyEcts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) throw new Error('ECTS-Kauf fehlgeschlagen');

            const updatedPlayer = await response.json();
            setBalance(updatedPlayer.ects);
        } catch (error: any) {
            console.error('Fehler beim Kauf von ECTS:', error);
            alert(error.message || 'Kauf fehlgeschlagen');
        }
    };

    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    const currentItems = allItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 0 && page < totalPages) setCurrentPage(page);
    };

    if (isLoading) return <div className="shop-loading">Loading...</div>;

    return (
        <div className="shop-container">


            {/* Balance */}
            <div className="balance-display">{balance}</div>

            {/* Buy ECTS Button (fixe Position, nicht im Header) */}
            <button
                className="buy-dollar-button invisible-button"
                onClick={() => {
                    if (userId !== null) {
                        localStorage.setItem('userId', userId.toString());
                        window.location.href = "src/shop/buy-ects.html";
                    }
                }}
            >
                Buy ECTS
            </button>

            {/* Page Buttons (fixe Position) */}
            <div className="page-buttons-vertical">
                <button
                    className="invisible-button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    ↑
                </button>
                <button
                    className="invisible-button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                >
                    ↓
                </button>
            </div>

            {/* Shop Grid */}
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
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'src/assets/default.png';
                            }}
                        />
                        {item.type === 'level' && (
                            <div className="shop-item-label">MAP</div>
                        )}
                        <div className="shop-item-price">{item.price} ECTS</div>
                        {ownedItems.includes(item.name) && (
                            <div className="shop-item-owned">OWNED</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Purchase Popup */}
            {showPurchasePopup && purchasedItem && (
                <div className="purchase-popup-overlay">
                    <div className="purchase-popup">
                        <h2>Purchased {purchasedItem.name}!</h2>
                        <img
                            src={purchasedItem.sprite}
                            alt={purchasedItem.name}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'src/assets/default.png';
                            }}
                        />
                        <button onClick={() => setShowPurchasePopup(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && <div className="shop-loading">Loading...</div>}
        </div>
    );


};

export default Shop;
