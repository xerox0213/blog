import ui from "@nuxt/ui/vue-plugin";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createApp } from "vue";

import App from "./app.vue";
import { router } from "./core/router";
import "./style.css";

const app = createApp(App);

app.use(VueQueryPlugin);

app.use(router);

app.use(ui);

app.mount("#app");
