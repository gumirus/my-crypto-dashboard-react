import React, { useEffect, useState } from 'react';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let intervalId;
    async function fetchCryptoNews() {
      setLoading(true);
      setError(false);
      try {
        const rssUrl = 'https://bitcoinnews.com/feed/';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!data.items || !Array.isArray(data.items)) throw new Error('No news');
        setNews(data.items.slice(0, 5));
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCryptoNews();
    intervalId = setInterval(fetchCryptoNews, 300000); // 5 минут
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="news">
      <h2>News</h2>
      <ul>
        {loading && <li>Loading...</li>}
        {error && <li style={{ color: '#e74c3c' }}>Ошибка загрузки новостей</li>}
        {!loading && !error && news.map((item, idx) => (
          <li key={idx}>
            <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default News; 