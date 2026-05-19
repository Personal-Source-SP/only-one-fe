'use client';

import { Slider, SliderSingleProps } from 'antd';

export type CustomSliderProps = SliderSingleProps;

export const CustomSlider = (props: CustomSliderProps) => <Slider {...props} />;
