import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GameScreen } from '../screens/game/GameScreen';

export type RootStackParamList = {
  Game: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Wordle UA' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
