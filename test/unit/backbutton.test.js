// import { mount } from '@vue/test-utils'
const BackButton = require( '../../src/components/BackButton.vue')

describe('ProjectView.vue', () => {
  it('renders project details', () => {
    const wrapper = mount(BackButton)
    expect(wrapper.text()).toContain('Project Details')
  })
})