import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/Main.vue'
import store from './store'
import config from './config';

Vue.use(Router)

var childRoutes = [
  {
    path: '',
    name: 'home',
    component: () => import('./views/Home.vue'),
    props: true,
    meta: { tab: 0 }
  },
  {
    path: '/saved',
    name: 'saved',
    component: () => import('./views/Home.vue'),
    props: { headerType: 'saved' },
    meta: { tab: 3 }
  },
  {
    path: '/more',
    name: 'more',
    component: () => import('./views/More.vue'),
    props: true,
    meta: { tab: 4 }
  }
];

// If categories are enabled, add that as a route
if (config.enableCategories) {
  childRoutes.push(
    {
      path: '/categories',
      name: 'categories',
      component: () => import('./views/Home.vue'),
      props: { headerType: 'categories' },
      meta: { tab: 1 }
    });
  }

  export default new Router({
    routes: [
      {
        path: '/',
        component: Main,
        children: childRoutes
      },
      {
        path: '/service/:name?',
        redirect: to => {
          const name = to.params.name;
          if (name) {
            const service = config.flavors[name];
            if (service) {
              console.log("Selecting service by param:", name);
              store.commit("setFlavor", name);
              store.state.onboarded = true;

              if ('static' in to.query) {
                console.log("Service selection is static!");
                store.commit("setFlavorStatic", true);
              }
            }
          }
          return '/';
        }
      },
      {
        path: '/onboarding',
        name: 'onboarding',
        component: () => import('./views/Onboarding.vue')
      }
    ]
  })
