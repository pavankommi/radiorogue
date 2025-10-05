import { fetchTopCryptos } from '@/api/blogService';

interface Crypto {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
}

const TopCryptosComponent = async () => {
    try {
        // Fetch top cryptocurrencies from the API
        const topCryptos: Crypto[] = await fetchTopCryptos();

        return (
            <div className="w-full p-2">
                <h2 className="text-sm font-semibold text-black">Crypto</h2>
                <p className="text-xs text-gray-600 mb-2">from <a href="https://www.coingecko.com/" className="underline text-blue-600">CoinGecko</a></p>

                {topCryptos && topCryptos.length > 0 ? (
                    <ul className="space-y-1">
                        {topCryptos.map((crypto: Crypto) => (
                            <li key={crypto.id} className="flex justify-between items-center py-1">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={crypto.image}
                                        alt={crypto.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <a
                                        href={`https://www.coingecko.com/en/coins/${crypto.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-black hover:underline"
                                    >
                                        {crypto.symbol.toUpperCase()}
                                    </a>
                                </div>

                                <div className="text-right text-xs text-black">
                                    <span>${crypto.current_price.toLocaleString()}</span>
                                    <span
                                        className={`ml-1 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                    >
                                        {crypto.price_change_percentage_24h.toFixed(2)}%
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-gray-600">No data available.</p>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error fetching top cryptocurrencies:', error);
        return <p className="text-xs text-gray-600">Error loading cryptocurrencies.</p>;
    }
};

export default TopCryptosComponent;
