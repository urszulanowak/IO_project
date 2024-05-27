import { getCookie, eraseCookie } from './cookie.js';

const JWT_REFRESH_INTERVAL = 1000 * 60 * 5; // 5 minutes

function refresh_jwt() {
    if (getCookie("logged_in") === undefined) {
        return;
    }
    fetch("user/refresh_jwt", { method: "POST" }).then((res) => {
        if (res.status === 200) {
            return;
        } else if (res.status === 403) {
            window.location.replace("/user/login_expired_token");
        }
    });
}
const interval = setInterval(refresh_jwt, JWT_REFRESH_INTERVAL);