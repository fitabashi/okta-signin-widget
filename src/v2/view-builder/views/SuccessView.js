import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Util from '../../../util/Util';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title () {
    // For more info on the API response available in appState, see IdxResponse:
    // https://github.com/okta/okta-core/blob/master/server/api/src/main/java/com/okta/api/mediation/
    // services/auth/IdxResponseBuilder.java
    const {label: appDisplayName} = this.options.appState.get('app');
    const {identifier: userEmail} = this.options.appState.get('user');

    return userEmail ? loc('oie.success.text.signingIn', 'login', [appDisplayName, userEmail]) :
      loc('oie.success.text.signingInWithoutIdentifier', 'login', appDisplayName);
  },
  noButtonBar: true,
  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    // TODO OKTA-250473
    // Form post for success redirect
    const url = this.options.currentViewState.href;
    Util.redirectWithFormGet(url);
  },

  render () {
    BaseForm.prototype.render.apply(this, arguments);
    this.add('<div class="okta-waiting-spinner"></div>');
  }
});

export default BaseView.extend({
  Body
});
