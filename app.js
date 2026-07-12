class Route {
    constructor(path, view) {
        if (typeof path !== 'string' || typeof view !== 'string') return;
        
        this.path = path;
        this.view = view;
    }

    static isValidRoute(route) {
        return (
            route instanceof Route && 
            typeof route.path === 'string' &&
            typeof route.view === 'string'
        );
    }
}

class Router {
    routes = [];

    constructor() { this.addRoute(new Route('/404', '/views/404.html')) }

    static withRoutes(list) {
        if (!Array.isArray(list)) throw new TypeError('List is not an array!');

        const router = new Router();
        for (const route of list) router.addRoute(route);
        Router.registerEvents(router);
        return router;
    }

    static registerEvents(router) {
        if (!(router instanceof Router)) return;
        if (router.routes.length === 0) return;

        window.addEventListener('click', (e) => {
            const link = e.target.closest('.link'); 
    
            if (link) {
                e.preventDefault();
                const url = link.getAttribute('href'); 
                window.history.pushState(null, null, url);
                router.route();
            }
        });

        router.route = router.route.bind(router);

        window.addEventListener('popstate', router.route);
        window.addEventListener('DOMContentLoaded', router.route);
    }

    addRoute(route) {
        if (!Route.isValidRoute(route)) return;
        if (this.routes.some(r => r.path === route.path) === true) return;
        this.routes.push(route);
    }

    getRoute(path) {
        if (typeof path !== 'string') return;

        const searchTarget = this.routes.find(r => r.path === path);
        return (searchTarget !== undefined)
            ? searchTarget
            : undefined;
    }

    async route() {
        const path = window.location.pathname;
        let route = this.getRoute(path) || this.getRoute('/404')
        let html = await this.getView(route.view);
        if (html === undefined && route.path !== '/404') {
            route = this.getRoute('/404');
            html = await this.getView(route.view);
        }

        const doc = new DOMParser().parseFromString(html, 'text/html');    
        document.title = doc.title;
        document.getElementById('app').innerHTML = doc.body.innerHTML;
    }

    async getView(path) {
        const response = await fetch(path);
        if (!response.ok) return undefined;
        return await response.text();
    }
}

Router.withRoutes([
    new Route('/', '/views/home.html'),
    new Route('/page-a', '/views/page-a.html'),
    new Route('/page-b', '/views/page-b.html')
]);