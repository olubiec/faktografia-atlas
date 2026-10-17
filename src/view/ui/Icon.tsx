import React from 'react';

type IconElement = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type AccessibleIconProps =
  | {
      'aria-label': string;
      'aria-labelledby'?: string;
      'aria-hidden'?: false;
    }
  | {
      'aria-label'?: string;
      'aria-labelledby': string;
      'aria-hidden'?: false;
    }
  | {
      'aria-label'?: undefined;
      'aria-labelledby'?: undefined;
      'aria-hidden': true;
    };

export type IconProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'aria-label' | 'aria-labelledby' | 'aria-hidden'
> &
  AccessibleIconProps & {
    icon: IconElement;
    size?: number | string;
    strokeWidth?: number | string;
  };

export function Icon({
  icon: Component,
  size = 20,
  strokeWidth = 1.5,
  className,
  ...props
}: IconProps) {
  return (
    <Component
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={className}
      role={props['aria-hidden'] ? undefined : 'img'}
      {...props}
    />
  );
}
