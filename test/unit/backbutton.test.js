const {mount} = require('@vue/test-utils')
// 
xdescribe('ProjectView.vue', () => {
  // const BackButton = require( '../../src/components/BackButton.vue')

  xit('renders project details', () => {
    const wrapper = mount(BackButton)
    expect(wrapper.text()).toContain('Project Details')
  })
})