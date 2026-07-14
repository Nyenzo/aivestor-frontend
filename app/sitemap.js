export default function sitemap() {
    return [
        { url: 'https://aivestor.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: 'https://aivestor.app/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: 'https://aivestor.app/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: 'https://aivestor.app/analytics', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ];
}
