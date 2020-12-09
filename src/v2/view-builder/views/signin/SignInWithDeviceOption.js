import { View, createButton, loc } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Util from '../../../../util/Util';
import Enums from '../../../../util/Enums';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container">
    {{#if signInWithDeviceIsRequired}}
      <div class="signin-with-ov-description">
        {{i18n code="oktaVerify.description" bundle="login"}}
      </div>
    {{/if}}
    </div>
    {{#unless signInWithDeviceIsRequired}}
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
    {{/unless}}
  `,
  initialize () {
    const appState = this.options.appState;
    const deviceChallengePollRemediation = this.options.appState.get('remediations')
      .find(remediation => remediation.name === Enums.LAUNCH_AUTHENTICATOR_REMEDIATION_NAME);
    const deviceChallengeRelatesTo = deviceChallengePollRemediation.relatesTo || {};
    const deviceChallenge = deviceChallengeRelatesTo.value || {};
    this.add(createButton({
      className: 'button',
      icon: 'okta-verify-authenticator',
      title: loc('oktaVerify.button', 'login'),
      click () {
        const isUVapproach = deviceChallenge.challengeMethod &&
          deviceChallenge.challengeMethod === Enums.UNIVERSAL_LINK_CHALLENGE;
        if (isUVapproach) {
          // launch the Okta Verify app
          Util.redirect(deviceChallenge.href);
        }
        if (this.options.isRequired) {
          appState.trigger('saveForm', this.model);
        } else {
          // OKTA-350084
          // For the universal link (iOS) approach,
          // we need to 1. launch the Okta Verify app
          // and 2. take the enduser to the next step right away
          // In Safari, when Okta Verify app is not installed, step 1 responds with error immediately,
          // then step 2 will respond with error.
          // To avoid showing the error right before switching to the next UI,
          // wait for 500 milliseconds before invoking step 2
          setTimeout(() => {
            appState.trigger('invokeAction', Enums.LAUNCH_AUTHENTICATOR_REMEDIATION_NAME);
          }, isUVapproach ? 500 : 0);
        }
      }
    }), '.okta-verify-container');
  },

  getTemplateData () {
    return {
      signInWithDeviceIsRequired: !!this.options.isRequired,
    };
  }
});