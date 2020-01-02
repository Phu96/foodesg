import * as React from 'react';

import { ConfigConsumer, ConfigContext, ConfigConsumerProps } from './context';

export interface ConfigProviderProps {
    prefixCls?: string;
    children?: React.ReactNode;
}

class ConfigProvider extends React.Component<ConfigProviderProps> {
    getPrefixCls = (suffixCls: string, customizePrefixCls?: string): string => {
        const { prefixCls = 'foodesg' } = this.props;

        if (customizePrefixCls) return customizePrefixCls;

        return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
    };

    renderProvider = (context: ConfigConsumerProps): React.ReactElement => {
        const { children } = this.props;

        const config: ConfigConsumerProps = {
            ...context,
            getPrefixCls: this.getPrefixCls,
        };

        return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
    };

    render() {
        return <ConfigConsumer>{context => this.renderProvider(context)}</ConfigConsumer>;
    }
}

export default ConfigProvider;
