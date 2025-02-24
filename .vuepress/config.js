module.exports = {
	"title": "熊猫圈里的老鼠屎",
	"description": "少年时光里的青春幻影",
	"dest": "public",
	//额外的需要被注入到当前页面的 HTML <head> 中的标签
	"head": [
		[
			"link",
			{
				"rel": "icon",
				"href": "/favicon.ico"
			}
		],
		[
			"meta",
			{
				"name": "viewport",
				"content": "width=device-width,initial-scale=1,user-scalable=no"
			}
		],
		// 引入jquery
		["script", {
			"language": "javascript",
			"type": "text/javascript",
			"src": "https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"
		}],
		// 引入鼠标点击脚本
		["script", {
			"language": "javascript",
			"type": "text/javascript",
			"src": "/js/MouseClickEffect.js"
		}],
		["link", {
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css'
		}],
		["link", {
			rel: "stylesheet",
			href: "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css"
		}]
	],
	"themeConfig": {
		//评论
		"valineConfig": {
			appId: 'KV4B0lMPrBweuLu48EFtpmIw-gzGzoHsz',// your appId
			appKey: 'cSa0NiFSITf3WFzMtbtOVn4c', // your appKey
			visitor: true,
		},
		//导航栏
		nav: [
			{
				"text": "无法发光的织女星",
				"link": "/",
				"icon": "reco-home"
			},

			{
				"text": "无限远点的牵牛星",
				"icon": "reco-message",
				"items": [
					{
						"text": "anime",
						"link": "/docs/anime/"
					},
					{
						"text": "考研！",
						"link": "/docs/postgraduate/"
					},
					{
						"text": "找工作",
						"link": "/docs/job/"
					},
				]
			},
			{
				"text": "与天同行的观测者",
				"link": "/timeline/",
				"icon": "reco-date"
			},
			{
				"text": "真的想要联系我吗",
				"icon": "reco-message",
				"items": [
					{
						"text": "Detail",
						"link": "https://iwannnn.cn/docs/detail",
						"icon": "reco-other"
					},
					{
						"text": "GitHub",
						"link": "https://github.com/Iwannnn",
						"icon": "reco-github"
					}
				]
			}
		],
		//侧边栏
		subSidebar: 'auto',
		sidebar: {
			"/docs/anime/": [
				"",
				"old_anime.md",
				"202204.md",
				"202207.md",
			],
			"/docs/postgraduate/": [
				"",
				"202205.md",
				"202206.md",
				"202207.md",
				"202208.md",
				"202209.md",
				"202210.md",
				"202211.md",
				"202212.md",
				"202302.md"
			],
			"/docs/jobs/": [
				"",
				"ubuntu.md"
			],
			"/blogs/": []
		},
		type: "blog",
		blogConfig: {
			"category": {
				"location": 2,
				"text": "克里斯蒂娜的分类"
			},
			"tag": {
				"location": 3,
				"text": "好想要露营的标签"
			}
		},
		//友链
		friendLink: [
		],
		// 密钥
		"logo": "/logo.png",
		"search": true,
		"searchMaxSuggestions": 10,

		//作者信息
		"author": "熊猫圈里的老鼠屎",
		"authorAvatar": "/avatar.png",

		//备案信息
		"record": "浙ICP备2021004697号-1",
		"recordLink": 'https://beian.miit.gov.cn/',
		"startYear": "2022",
	},
	"markdown": {
		"lineNumbers": true
	},
	configureWebpack: {
		resolve: {
			alias: {
				'@docs': 'docs',
				'@blog': 'blogs'
			}
		}
	},
	plugins: [
		// 浏览器cpu消耗太太太大了，一个miku就占50%了
		// [
		// 	"@vuepress-reco/vuepress-plugin-kan-ban-niang",
		// 	{
		// 		theme: ["miku"],
		// 		clean: true,
		// 		width: 175,
		// 		modelStyle: {
		// 			position: "fixed",
		// 			left: "0px",
		// 			bottom: "70px",
		// 			opacity: "0.9",
		// 			zIndex: 99999
		// 		}
		// 	}
		// ],
		[
			"dynamic-title",
			{
				showIcon: "/favicon.ico",
				showText: "摇曳露营是神!",
				hideIcon: "/failure.ico",
				hideText: "El Psy Kongroo.",
				recoverTime: 2000
			}
		],
		["vuepress-plugin-nuggets-style-copy", {
			copyText: "复制代码",
			tip: {
				content: "复制成功!"
			}
		}],
		['meting', {
			metingApi: "https://api.injahow.cn/meting/",
			meting: {
				auto: "https://music.163.com/#/playlist?id=7736704550"
			},
			// 不配置该项的话不会出现全局播放器
			aplayer: {
				// 吸底模式
				fixed: true,
				mini: true,
				// 自动播放
				autoplay: true,
				// 歌曲栏折叠
				listFolded: true,
				// 颜色
				theme: '#39C5BB',
				// 播放顺序为随机
				order: 'random',
				// 初始音量
				volume: 0.1,
				// 关闭歌词显示
				lrcType: 0,
			},
			mobile: {
				// 手机端去掉cover图
				cover: false,
			}
		}],
		// ['@vuepress-reco/comments', {
		// 	solution: 'valine',
		// 	options: {
		// 		appId: 'KV4B0lMPrBweuLu48EFtpmIw-gzGzoHsz',// your appId
		// 		appKey: 'cSa0NiFSITf3WFzMtbtOVn4c', // your appKey
		// 	}
		// }],
		[
			"@vuepress/medium-zoom", {
				selector: '.theme-reco-content :not(a) > img',
				// medium-zoom options here
				// See: https://github.com/francoischalifour/medium-zoom#options
				options: {
					margin: 16,
				}
			}
		],
		["ribbon-animation", {
			size: 90,   // 默认数据
			opacity: 0.3,  //  透明度
			zIndex: -1,   //  层级
			opt: {
				// 色带HSL饱和度
				colorSaturation: "80%",
				// 色带HSL亮度量
				colorBrightness: "60%",
				// 带状颜色不透明度
				colorAlpha: 0.65,
				// 在HSL颜色空间中循环显示颜色的速度有多快
				colorCycleSpeed: 6,
				// 从哪一侧开始Y轴 (top|min, middle|center, bottom|max, random)
				verticalPosition: "center",
				// 到达屏幕另一侧的速度有多快
				horizontalSpeed: 200,
				// 在任何给定时间，屏幕上会保留多少条带
				ribbonCount: 2,
				// 添加笔划以及色带填充颜色
				strokeSize: 0,
				// 通过页面滚动上的因子垂直移动色带
				parallaxAmount: -0.5,
				// 随着时间的推移，为每个功能区添加动画效果
				animateSections: true
			},
			ribbonShow: false, //  点击彩带  true显示  false为不显示
			ribbonAnimationShow: true  // 滑动彩带
		}],
		['@vuepress/pwa', {
			serviceWorker: true,
			updatePopup: {
				message: "发现新内容可用",
				buttonText: "刷新"
			}
		}],
		['@vuepress-reco/vuepress-plugin-pagation', {}],
		['@vuepress-reco/vuepress-plugin-loading-page', {}]
	],
	markdown: {
		// markdown-it-anchor 的选项
		anchor: { permalink: false },
		// markdown-it-toc 的选项
		toc: { includeLevel: [1, 2] },
		extendMarkdown: md => {
			// 使用更多的 markdown-it 插件!
			md.set({ html: true });
			md.use(require("markdown-it-katex"));
		}
	}
}