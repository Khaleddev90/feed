import mfaApi from '../../services/new_api/mfa.js'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
export default {
  data: () => ({
    code: null,
    error: false
  }),
  computed: {
    ...mapGetters({
      authApp: 'authFlow/app',
      authSettings: 'authFlow/settings'
    }),
    ...mapState({ instance: 'instance' })
  },
  methods: {
    ...mapMutations('authFlow', ['requireRecovery', 'abortMFA']),
    ...mapActions({ login: 'authFlow/login' }),
    clearError () { this.error = false },
    submit () {
      const data = {
        app: this.authApp,
        instance: this.instance.server,
        mfaToken: this.authSettings.mfa_token,
        code: this.code
      }

      mfaApi.verifyOTPCode(data).then((result) => {
        if (result.error) {
          this.error = result.error
          this.code = null
          return
        }

        this.login(result).then(() => {
          this.$router.push({ name: 'friends' })
        })
      })
    }
  }
}
