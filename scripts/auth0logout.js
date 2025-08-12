(async () => {
    // Load Auth0 SPA SDK
    await new Promise((resolve, reject) => {
        if (window.createAuth0Client) {
            resolve(); // Already loaded
            return;
        }
        const script = document.createElement('script');
        script.src = "https://cdn.auth0.com/js/auth0-spa-js/1.19/auth0-spa-js.production.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Auth0 SDK'));
        document.head.appendChild(script);
    });

    const auth0 = await createAuth0Client({
        domain: "dev-qg3qbkkpi8qny7kq.us.auth0.com",
        client_id: "QPszy23JdbDsp6kUVw5Tgjp39tWvq3ZD"
    });

    // Log the user out and redirect to homepage
    auth0.logout({
        returnTo: window.location.origin
    });
})();