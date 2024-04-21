import { mount } from '@vue/test-utils'
import ProjectView from '../../src/views/ProjectView.vue'

describe('ProjectView.vue', () => {
  it('renders project details', () => {
    const wrapper = mount(ProjectView)
    expect(wrapper.text()).toContain('Project Details')
  })
})