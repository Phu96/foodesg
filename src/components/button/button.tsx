import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'omit.js';

import { Omit, tupleStr } from '../utils/type';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider/context';

const iconfontCssPrefix: string = 'fooicn';
const ButtonTypes = tupleStr('default', 'primary', 'dashed', 'danger', 'link');
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes = tupleStr('circle', 'round');
export type ButtonShape = typeof ButtonShapes[number];
const ButtonSizes = tupleStr('large', 'default', 'small');
export type ButtonSize = typeof ButtonSizes[number];
const ButtonHTMLTypes = tupleStr('submit', 'button', 'reset');
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

export interface BaseButtonProps {
    type?: ButtonType;
    icon?: React.ReactNode;
    shape?: ButtonShape;
    size?: ButtonSize;
    loading?: boolean | { delay?: number };
    prefixCls?: string;
    className?: string;
    children?: React.ReactNode;
    block?: boolean;
}

export type AnchorButtonProps = {
    href: string;
    target?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
    Omit<React.AnchorHTMLAttributes<any>, 'type' | 'onClick'>;

export type NativeButtonProps = {
    htmlType?: ButtonHTMLType;
    onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
    Omit<React.ButtonHTMLAttributes<any>, 'type' | 'onClick'>;

export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

export interface ButtonState {
    loading?: boolean | { delay?: number };
}

class Button extends React.Component<ButtonProps, ButtonState> {
    static defaultProps = {
        loading: false,
        block: false,
        htmlType: 'button',
    };

    static propTypes = {
        type: PropTypes.string,
        shape: PropTypes.oneOf(ButtonShapes),
        size: PropTypes.oneOf(ButtonSizes),
        htmlType: PropTypes.oneOf(ButtonHTMLTypes),
        onClick: PropTypes.func,
        loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
        className: PropTypes.string,
        icon: PropTypes.node,
        block: PropTypes.bool,
        title: PropTypes.string,
    };

    private delayTimeout: number;

    private buttonNode: HTMLElement | null;

    constructor(props: ButtonProps) {
        super(props);
        this.state = {
            loading: this.props.loading,
        } as ButtonState;
    }

    componentDidUpdate(prevProps: ButtonProps) {
        if (prevProps.loading && typeof prevProps.loading !== 'boolean') {
            window.clearTimeout(this.delayTimeout);
        }

        const { loading } = this.props;
        if (loading && typeof loading !== 'boolean' && loading.delay) {
            this.delayTimeout = window.setTimeout(() => {
                this.setState({ loading });
            }, loading.delay);
        } else if (prevProps.loading !== loading) {
            this.setState({ loading });
        }
    }

    componentWillUnmount() {
        if (this.delayTimeout) {
            clearTimeout(this.delayTimeout);
        }
    }

    saveButtonRef = (node: HTMLElement | null) => {
        this.buttonNode = node;
    };

    handleClick: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = event => {
        const { loading } = this.state;
        const { onClick } = this.props;
        if (loading) return;
        if (onClick) (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)(event);
    };

    renderButton = ({ getPrefixCls }: ConfigConsumerProps): any => {
        const {
            prefixCls: customizePrefixCls,
            type,
            shape,
            size,
            className,
            children,
            icon,
            block,
            ...rest
        } = this.props;
        const { loading } = this.state;

        const prefixCls = getPrefixCls('btn', customizePrefixCls);

        let sizeCls = '';
        switch (size) {
            case 'large':
                sizeCls = 'lg';
                break;
            case 'small':
                sizeCls = 'sm';
                break;
            default:
                break;
        }

        const Icon = loading ? <i className={classNames(iconfontCssPrefix, 'fa', 'fa-refresh', 'fa-spin')} /> : icon;

        const classes = classNames(prefixCls, className, {
            [`${prefixCls}-${type}`]: type,
            [`${prefixCls}-${shape}`]: shape,
            [`${prefixCls}-${sizeCls}`]: sizeCls,
            [`${prefixCls}-icon-only`]: !children && children !== 0 && Icon,
            [`${prefixCls}-loading`]: !!loading,
            [`${prefixCls}-block`]: block,
        });

        const iconNode = Icon ? Icon : null;
        const kids = children;

        const linkButtonRestProps = omit(rest as AnchorButtonProps, ['htmlType', 'loading']);
        if (linkButtonRestProps.href !== undefined) {
            return (
                <a {...linkButtonRestProps} className={classes} onClick={this.handleClick} ref={this.saveButtonRef}>
                    {iconNode}
                    {kids}
                </a>
            );
        }

        const { htmlType, ...otherProps } = rest as NativeButtonProps;

        const buttonNode = (
            <button
                {...(omit(otherProps, ['loading']) as NativeButtonProps)}
                type={htmlType}
                className={classes}
                onClick={this.handleClick}
                ref={this.saveButtonRef}
            >
                {iconNode}
                {kids}
            </button>
        );

        if (type !== 'link') {
            return buttonNode;
        }
    };

    render() {
        return <ConfigConsumer>{this.renderButton}</ConfigConsumer>;
    }
}

export default Button;
