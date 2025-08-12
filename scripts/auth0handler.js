(async () => {
    // Hide the page content initially
    document.body.style.display = 'none';

    // Load Auth0 SPA SDK script dynamically
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdn.auth0.com/js/auth0-spa-js/1.19/auth0-spa-js.production.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    const auth0 = await createAuth0Client({
        domain: "dev-qg3qbkkpi8qny7kq.us.auth0.com",
        client_id: "QPszy23JdbDsp6kUVw5Tgjp39tWvq3ZD",
        cacheLocation: "localstorage",
        useRefreshTokens: true
    });

    // Handle redirect callback after login
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        await auth0.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if user is authenticated
    const isAuthenticated = await auth0.isAuthenticated();

    if (!isAuthenticated) {
        // Not logged in: redirect to login and come back here after
        await auth0.loginWithRedirect({
            redirect_uri: window.location.origin + window.location.pathname
        });
        return; // stop execution here
    }

    // Logged in: show page content
    document.body.style.display = 'block';

    // Optional: display user info in an element with id="user-profile" if present
    const user = await auth0.getUser();
    const profileElem = document.getElementById('user-profile');
    if (profileElem) {
        profileElem.textContent = `Hello, ${user.name || user.email}!`;
    }

    // Expose a global logout function
    window.logout = () => {
        auth0.logout({
            returnTo: window.location.origin
        });
    };
})();

