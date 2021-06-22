/**
 * 获取通知的权限
 */
function showNoti(title = '') {
	if (!('Notification' in window)) {
		//没有权限
	} else if (Notification.permission === 'granted') {
		new Notification(title);
	} else if (Notification.permission !== 'denied') {
		Notification.requestPermission().then(function (permission) {
			if (permission === 'granted') {
				new Notification(title);
			}
		});
	}
}

let context = chrome.extension.getBackgroundPage();

let cookie = '';
const url = 'http://34web.cn';

function getInfo(cb) {
	chrome.cookies.get(
		{
			url,
			name: 'Authorization',
		},
		(cookies) => {
			if (!cookies && cookies.value) {
				context.check();
				document.querySelector('.status .success').style.display =
					'block';
				document.querySelector('.status .failed').style.display =
					'none';
				cb && cb(true);
			} else {
				document.querySelector('.status .success').style.display =
					'none';
				document.querySelector('.status .failed').style.display =
					'block';
				cb && cb(false);
			}
		}
	);
}

getInfo();

//刷新
document.querySelector('#refreshBtn').addEventListener('click', (e) => {
	e.preventDefault();
	getInfo((res) => {
		showNoti(res ? '最新状态: 已登录' : '最新状态: 暂未登录');
	});
});
