export default defineAppConfig({
  pages: ['pages/home/index', 'pages/me/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'rebook',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#7A7E83',
    selectedColor: '#1677FF',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/me/index', text: '我的' },
    ],
  },
});
