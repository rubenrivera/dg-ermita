---
{"dg-publish":true,"permalink":"/spa-sdk-sample/","title":"SPA SDK Sample","tags":["gardenEntry"],"created":"2024-02-13T19:08:52.628-06:00","updated":"2024-02-13T19:49:34.519-06:00"}
---

<div id="app" class="h-100 d-flex flex-column">
<div class="nav-container">
<div class="container">
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"	aria-controls="navbarNav"	  aria-expanded="false"	 aria-label="Toggle navigation">
<span class="navbar-toggler-icon"></span>
</button>
<div class="collapse navbar-collapse" id="navbarNav">

<a href="/" class="nav-link route-link">Home</a>
<!-- Login button: show if NOT authenticated -->
<button	id="qsLoginBtn"	onclick="login()"	class="btn btn-primary btn-margin auth-invisible hidden">Log in</button>
<!-- / Login button -->
<!-- Fullsize dropdown: show if authenticated -->
<a class="nav-link dropdown-toggle" href="#" id="profileDropDown"	data-toggle="dropdown" >
<!-- Profile image should be set to the profile picture from the id token -->
<img alt="Profile picture" class="nav-user-profile profile-image rounded-circle"	 width="50" /></a>
<div class="dropdown-menu">
<!-- Show the user's full name from the id token here -->
<div class="dropdown-header nav-user-name user-name"></div>
<a href="/profile" class="dropdown-item dropdown-profile route-link">Profile</a>
<a href="#" class="dropdown-item"	 id="qsLogoutBtn"  onclick="logout()">Log out</a>
</div>
<!-- /Fullsize dropdown -->
<!-- Responsive login button: show if NOT authenticated -->
<button class="btn btn-primary btn-block auth-invisible hidden" id="qsLoginBtn" 	  onclick="login()">Log in</button>
<!-- /Responsive login button -->
<!-- Responsive profile dropdown: show if authenticated -->
<span class="user-info">
<!-- Profile image should be set to the profile picture from the id token -->
<img  alt="Profile picture"	  class="nav-user-profile	d-inline-block	profile-image rounded-circle	mr-3"  width="50"/>
<!-- Show the user's full name from the id token here -->
<h6 class="d-inline-block nav-user-name user-name"></h6>
</span>
<a href="/profile" class="route-link">Profile</a>
<a href="#" id="qsLogoutBtn" onclick="logout()">Log out</a>
</div>
</div>
</div>
<div id="main-content" class="container mt-5 flex-grow-1">
<div id="content-home" class="page">
<div class="text-center hero">
<h1 class="mb-4">JavaScript Sample Project</h1>
<p class="lead">This is a sample application that demonstrates an authentication flow for an SPA, using plain JavaScript</p>
</div>
</div>
<div class="page" id="content-profile">
<div class="container">
<div class="row align-items-center profile-header">
<div class="col-md-2">
<img  alt="User's profile picture"  class="rounded-circle img-fluid profile-image mb-3 mb-md-0"/>
</div>
<div class="col-md">
<h2 class="user-name"></h2>
<p class="lead text-muted user-email"></p>
</div>
</div>
<div class="row">
<pre class="rounded"><code id="profile-data" class="json"></code></pre>
</div>
</div>
</div>
</div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js"></script>

<script>
// URL mapping, from hash to a function that responds to that URL action
const router = {
  "/": () => showContent("content-home"),
  "/profile": () =>
    requireAuth(() => showContent("content-profile"), "/profile"),
  "/login": () => login()
};

//Declare helper functions

/**
 * Iterates over the elements matching 'selector' and passes them
 * to 'fn'
 * @param {*} selector The CSS selector to find
 * @param {*} fn The function to execute for every element
 */
const eachElement = (selector, fn) => {
  for (let e of document.querySelectorAll(selector)) {
    fn(e);
  }
};

/**
 * Tries to display a content panel that is referenced
 * by the specified route URL. These are matched using the
 * router, defined above.
 * @param {*} url The route URL
 */
const showContentFromUrl = (url) => {
  if (router[url]) {
    router[url]();
    return true;
  }

  return false;
};

/**
 * Returns true if `element` is a hyperlink that can be considered a link to another SPA route
 * @param {*} element The element to check
 */
const isRouteLink = (element) =>
  element.tagName === "A" && element.classList.contains("route-link");

/**
 * Displays a content panel specified by the given element id.
 * All the panels that participate in this flow should have the 'page' class applied,
 * so that it can be correctly hidden before the requested content is shown.
 * @param {*} id The id of the content to show
 */
const showContent = (id) => {
  eachElement(".page", (p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};

/**
 * Updates the user interface
 */
const updateUI = async () => {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0Client.getUser();

      document.getElementById("profile-data").innerText = JSON.stringify(
        user,
        null,
        2
      );

      document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

      eachElement(".profile-image", (e) => (e.src = user.picture));
      eachElement(".user-name", (e) => (e.innerText = user.name));
      eachElement(".user-email", (e) => (e.innerText = user.email));
      eachElement(".auth-invisible", (e) => e.classList.add("hidden"));
      eachElement(".auth-visible", (e) => e.classList.remove("hidden"));
    } else {
      eachElement(".auth-invisible", (e) => e.classList.remove("hidden"));
      eachElement(".auth-visible", (e) => e.classList.add("hidden"));
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }

  console.log("UI updated");
};

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};
</script>

<script>
// The Auth0 client, initialized in configureClient()
let auth0Client = null;

/**
 * Starts the authentication flow
 */
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0Client.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Executes the logout flow
 */
const logout = async () => {
  try {
    console.log("Logging out");
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/**
 * Retrieves the auth configuration from the server
 */
const fetchAuthConfig = () => fetch("/auth_config.json");

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: config.clientId
  });
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL
  if (!showContentFromUrl(window.location.pathname)) {
    showContentFromUrl("/");
    window.history.replaceState({ url: "/" }, {}, "/");
  }

  const bodyElement = document.getElementsByTagName("body")[0];

  // Listen out for clicks on any hyperlink that navigates to a #/ URL
  bodyElement.addEventListener("click", (e) => {
    if (isRouteLink(e.target)) {
      const url = e.target.getAttribute("href");

      if (showContentFromUrl(url)) {
        e.preventDefault();
        window.history.pushState({ url }, {}, url);
      }
    }
  });

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");
    window.history.replaceState({}, document.title, window.location.pathname);
    updateUI();
    return;
  }

  console.log("> User not authenticated");

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");
    try {
      const result = await auth0Client.handleRedirectCallback();

      if (result.appState && result.appState.targetUrl) {
        showContentFromUrl(result.appState.targetUrl);
      }

      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }

  updateUI();
};

</script>



