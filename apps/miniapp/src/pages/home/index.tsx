import { View, Text } from '@tarojs/components';
import { Cell } from '@nutui/nutui-react-taro';

export default function HomePage() {
  return (
    <View className="page">
      <View style={{ padding: '24rpx' }}>
        <Text style={{ fontSize: '36rpx', fontWeight: 600 }}>欢迎来到 rebook</Text>
      </View>
      <Cell title="书籍列表" description="按 taro-page skill 在 services + pages 中实现" />
      <Cell title="发布二手书" description="待实现" />
    </View>
  );
}
