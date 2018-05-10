import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router';

import Util from './libs/util';
import App from './app.vue';
import 'iview/dist/styles/iview.css';

import NebPay from './libs/nebpay';


Vue.use(VueRouter);


Vue.use(iView);



// 路由配置
const RouterConfig = {
    mode: 'hash',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

let nebPay = new NebPay();

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    localStorage.removeItem('nasAddress');
    nebPay.simulateCall(Util.getContractAddress(), "0", "getUserAddress", "", {
        listener: (res) => {
            const address = Util.parse(res.result);
            localStorage.setItem('nasAddress', address);
        }
    });
    next();
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});



new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
});