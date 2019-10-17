import Status from '../status/status.vue'
import UserAvatar from '../user_avatar/user_avatar.vue'
import UserCard from '../user_card/user_card.vue'
import Timeago from '../timeago/timeago.vue'
import { highlightClass, highlightStyle } from '../../services/user_highlighter/user_highlighter.js'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'

const Notification = {
  data () {
    return {
      userExpanded: false,
      betterShadow: this.$store.state.interface.browserSupport.cssFilter,
      unmuted: false
    }
  },
  props: [ 'notification' ],
  components: {
    Status,
    UserAvatar,
    UserCard,
    Timeago
  },
  methods: {
    toggleUserExpanded () {
      this.userExpanded = !this.userExpanded
    },
    generateUserProfileLink (user) {
      return generateProfileLink(user.id, user.screen_name, this.$store.state.instance.restrictedNicknames)
    },
    getUser (notification) {
      return this.$store.state.users.usersObject[notification.from_profile.id]
    },
    toggleMute () {
      this.unmuted = !this.unmuted
    }
  },
  computed: {
    userClass () {
      return highlightClass(this.notification.from_profile)
    },
    userStyle () {
      const highlight = this.$store.state.config.highlight
      const user = this.notification.from_profile
      return highlightStyle(highlight[user.screen_name])
    },
    userInStore () {
      return this.$store.getters.findUser(this.notification.from_profile.id)
    },
    user () {
      if (this.userInStore) {
        return this.userInStore
      }
      return this.notification.from_profile
    },
    userProfileLink () {
      return this.generateUserProfileLink(this.user)
    },
    needMute () {
      return this.user.muted
    }
  }
}

export default Notification
