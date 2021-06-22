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

/**
 * fetch获取所有分类
 */
function getAllCate(Cookie, cb) {
	fetch('http://api.34web.cn/api/category/all', {
		headers: {
			Cookie: Cookie,
		},
	})
		.then(function (response) {
			return response.json();
		})
		.then(function (responseData) {
			cb && cb(responseData);
		});
}

/**
 * 添加链接
 */
function addLink(cateId, Cookie) {
	return () => {
		chrome.tabs.query(
			{ active: true, currentWindow: true },
			function (tabs) {
				let title = tabs[0].title;
				let url = tabs[0].url;
				fetch('http://api.34web.cn/api/link/add', {
					body: JSON.stringify({
						cateId: cateId,
						description: '',
						href: url,
						name: title.substr(0, 20),
						type: 'LINK',
					}),
					headers: {
						'Content-Type': 'application/json;charset=utf-8',
						Cookie,
					},
					method: 'POST',
				})
					.then(function (response) {
						return response.json();
					})
					.then(function (res) {
						if (res.success) {
							showNoti('添加成功');
						} else {
							showNoti(res.message);
						}
					});
			}
		);
	};
}

/**
 * 检查更新
 */
function check() {
	const url = 'http://34web.cn';
	chrome.cookies.get(
		{
			url,
			name: 'Authorization',
		},
		(cookies) => {
			if (cookies && cookies.value) {
				getAllCate(cookies.value, (res) => {
					if (res && res.data && res.data.length) {
						chrome.contextMenus.removeAll();
						//有数据则添加到菜单
						chrome.contextMenus.create({
							title: '将此链接添加至',
							id: '34web_menu',
							contexts: ['page'],
						});
						for (let index = 0; index < res.data.length; index++) {
							const item = res.data[index];
							chrome.contextMenus.create({
								title: item.name,
								id: '34web_menu_child' + item.cateId,
								parentId: '34web_menu',
								contexts: ['page'],
								onclick: addLink(item.cateId, cookies.value),
							});
						}
					}
				});
			}
		}
	);
}

check();
