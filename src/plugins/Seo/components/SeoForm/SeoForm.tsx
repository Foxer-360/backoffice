import * as React from 'react';
import SeoSettings from '../SeoSettings';
import { SeoPluginData } from '@source/plugins/Seo/Seo';

interface SeoFormProps {
  loading: boolean;

  page: string;
  language: string;

  data: SeoPluginData;

  pages: LooseObject[];

  onChangeData: Function;

  useSocialMetaForAll: boolean;
}

interface SeoFormState {
  data: SeoPluginData;
}

class SeoForm extends React.Component<SeoFormProps, SeoFormState> {

  constructor(props: SeoFormProps) {
    super(props);

    this.state = {
      data: null,
    };

    this.handleChangeData = this.handleChangeData.bind(this);
  }

  componentWillReceiveProps(nextProps: SeoFormProps) {
    if (this.state.data === null) {
      this.handleChangeData(nextProps.data);
    }
  }

  handleChangeData(data: LooseObject) {
    this.setState({
      data: Object.assign({...this.state.data}, data)
    }, () => {
      if (this.props.onChangeData) {
        this.props.onChangeData(this.state.data);
      }
    });
  }

  render() {
    const {
      loading,
    } = this.props;

    if (loading || !this.props) {
      return null;
    }

    return (
      <div className="content__holder">
        <SeoSettings
          {...this.props}
          currentPage={this.props.page || null}
          currentLanguage={this.props.language || null}

          url={this.state.data && this.state.data.url || ''}
          pages={this.props.pages}

          title={this.state.data && this.state.data.title || ''}
          description={this.state.data && this.state.data.description || ''}
          focusKeyword={this.state.data && this.state.data.focusKeyword  || ''}
          facebookTitle={this.state.data && this.state.data.facebookTitle || ''}
          facebookPublisher={this.state.data && this.state.data.facebookPublisher || ''}
          facebookDescription={this.state.data && this.state.data.facebookDescription || ''}
          facebookImage={this.state.data && this.state.data.facebookImage || ''}
          twitterTitle={this.state.data && this.state.data.twitterTitle || ''}
          twitterPublisher={this.state.data && this.state.data.twitterPublisher || ''}
          twitterDescription={this.state.data && this.state.data.twitterDescription || ''}
          twitterImage={this.state.data && this.state.data.twitterImage || ''}
          googlePlusTitle={this.state.data && this.state.data.googlePlusTitle || ''}
          googlePlusPublisher={this.state.data && this.state.data.googlePlusPublisher || ''}
          googlePlusImage={this.state.data && this.state.data.googlePlusImage || ''}

          loading={loading}

          updateTitle={(data: string) => this.handleChangeData({ title: data })}
          updateDescription={(data: string) => this.handleChangeData({ description: data })}
          updateFocusKeyword={(data: string) => this.handleChangeData({ focusKeyword: data })}
          updateFacebookTitle={(data: string) => this.handleChangeData({ facebookTitle: data })}
          updateFacebookPublisher={(data: string) => this.handleChangeData({ facebookPublisher: data })}
          updateFacebookDescription={(data: string) => this.handleChangeData({ facebookDescription: data })}
          updateFacebookImage={(data: string) => this.handleChangeData({ facebookImage: data })}
          updateTwitterTitle={(data: string) => this.handleChangeData({ twitterTitle: data })}
          updateTwitterPublisher={(data: string) => this.handleChangeData({ twitterPublisher: data })}
          updateTwitterDescription={(data: string) => this.handleChangeData({ twitterDescription: data })}
          updateTwitterImage={(data: string) => this.handleChangeData({ twitterImage: data })}
          updateGooglePlusTitle={(data: string) => this.handleChangeData({ googlePlusTitle: data })}
          updateGooglePlusPublisher={(data: string) => this.handleChangeData({ googlePlusPublisher: data })}
          updateGooglePlusImage={(data: string) => this.handleChangeData({ googlePlusImage: data })}
        />
      </div>
    );
  }
}

export default SeoForm;