import { useState } from 'react';
import { useLatest } from 'ahooks';

const useGetState = (initialState) => {
  const [state, setState] = useState(initialState);
  const latestState = useLatest(state); // 使用 useLatest 包装 state

  const getState = () => latestState.current; // 使用 latestState.current 获取最新的状态值

  return [state, setState, getState];
};

export default useGetState;
