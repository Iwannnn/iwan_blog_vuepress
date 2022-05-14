module.exports = {
	"title": "Iwan blog",
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
		}]
	],
	"themeConfig": {
		//导航栏
		"nav": [
			{
				"text": "可能是真实的首页",
				"link": "/",
				"icon": "reco-home"
			},

			{
				"text": "假装有记录的文档",
				"icon": "reco-message",
				"items": [
					{
						"text": "anime",
						"link": "/docs/anime/"
					},
					{
						"text": "考研！",
						"link": "/docs/postgraduate/"
					}
				]
			},
			{
				"text": "无限变换的时间线",
				"link": "/timeline/",
				"icon": "reco-date"
			},
			{
				"text": "真的想要联系我吗",
				"icon": "reco-message",
				"items": [
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
		"sidebar": {
			"/docs/anime/": [
				"",
				"202204.md"
			],
			"/docs/postgraduate/": [
				"",
				"202205.md"
			]
		},
		"type": "blog",
		"blogConfig": {
			"category": {
				"location": 2,
				"text": "克里斯蒂娜的分类"
			},
			"tag": {
				"location": 3,
				"text": "好想要露营的标签"
			}
		},
		"friendLink": [
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
		[
			"@vuepress-reco/vuepress-plugin-kan-ban-niang",
			{
				theme: ["miku"],
				clean: true,
				width: 175,
				modelStyle: {
					position: "fixed",
					left: "0px",
					bottom: "70px",
					opacity: "0.9",
					zIndex: 99999
				}
			}
		],
		['@vuepress-reco/comments', {
			solution: 'valine',
			options: {
				appId: 'KV4B0lMPrBweuLu48EFtpmIw-gzGzoHsz',// your appId
				appKey: 'cSa0NiFSITf3WFzMtbtOVn4c', // your appKey
			}
		}
		],
		['@vuepress-reco/vuepress-plugin-bulletin-popover', {
			width: '300px', // 默认 260px
			title: '消息提示',
			body: [
				{
					type: 'hahaha',
					content: 'hahah',
					style: 'text-aligin: center;'
				},
			],
			footer: [
				{
					type: 'button',
					text: '打赏',
					link: '/donate'
				}
			]
		}],
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
			metingApi: "https://api.vlssu.com/meting/",
			meting: {
				auto: "https://music.163.com/#/playlist?id=369312229"
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
				theme: '#f9bcdd',
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
		[
			"@vuepress/medium-zoom", {
				selector: 'img.zoom-custom-imgs',
				// medium-zoom options here
				// See: https://github.com/francoischalifour/medium-zoom#options
				options: {
					margin: 16
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
		}]
	]
}