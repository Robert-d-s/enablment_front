import React from 'react'
import { render, screen } from '@/test-utils'
import SectionWrapper from '../sectionWrapper'

// Mock the section components
jest.mock('../peopleSection', () => {
  const MockPeopleSection = ({ isActive }: { isActive: boolean }) => (
    <div data-testid="people-section" data-active={isActive}>
      People Section Content
    </div>
  )
  MockPeopleSection.displayName = 'MockPeopleSection'
  return MockPeopleSection
})

jest.mock('../aboutSection', () => {
  const MockAboutSection = () => (
    <div data-testid="about-section">About Section Content</div>
  )
  MockAboutSection.displayName = 'MockAboutSection'
  return MockAboutSection
})

jest.mock('../servicesSection', () => {
  const MockServicesSection = () => (
    <div data-testid="services-section">Services Section Content</div>
  )
  MockServicesSection.displayName = 'MockServicesSection'
  return MockServicesSection
})

describe('SectionWrapper', () => {
  const defaultProps = {
    id: 'test',
    content: 'Test Content',
    color: 'bg-white',
  }

  describe('Container styling', () => {
    it('should render with correct base classes', () => {
      render(<SectionWrapper {...defaultProps} />)

      const section = screen.getByText('Test Content').closest('.section')
      expect(section).toHaveClass(
        'section',
        'border-2',
        'border-green-600',
        'rounded-tl-3xl',
        'rounded-tr-3xl',
        'shadow-lg',
        'bg-white',
        'responsive-section'
      )
    })

    it('should apply custom color class', () => {
      render(<SectionWrapper {...defaultProps} color="bg-blue-500" />)

      const section = screen.getByText('Test Content').closest('.section')
      expect(section).toHaveClass('bg-blue-500')
    })

    it('should have correct inline styles', () => {
      render(<SectionWrapper {...defaultProps} />)

      const section = screen.getByText('Test Content').closest('.section')
      expect(section).toHaveStyle({
        width: '100%',
        boxSizing: 'border-box',
      })
    })
  })

  describe('People section rendering', () => {
    it('should render PeopleSection when id is "People"', () => {
      render(<SectionWrapper {...defaultProps} id="People" />)

      expect(screen.getByTestId('people-section')).toBeInTheDocument()
      expect(screen.getByTestId('people-section')).toHaveAttribute('data-active', 'true')
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    })

    it('should wrap PeopleSection in scrollable container', () => {
      render(<SectionWrapper {...defaultProps} id="People" />)

      const scrollContainer = screen.getByTestId('people-section').closest('.overflow-y-auto')
      expect(scrollContainer).toHaveStyle({
        maxHeight: 'calc(100vh - 200px)',
      })
    })
  })

  describe('About section rendering', () => {
    it('should render AboutSection when id is "About"', () => {
      render(<SectionWrapper {...defaultProps} id="About" />)

      expect(screen.getByTestId('about-section')).toBeInTheDocument()
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    })
  })

  describe('Services section rendering', () => {
    it('should render ServicesSection when id is "Services"', () => {
      render(<SectionWrapper {...defaultProps} id="Services" />)

      expect(screen.getByTestId('services-section')).toBeInTheDocument()
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    })
  })

  describe('Video section rendering', () => {
    const videoProps = {
      ...defaultProps,
      id: 'video',
      videoSrc: '/video/sample.mp4',
    }

    it('should render video element when videoSrc is provided', () => {
      render(<SectionWrapper {...videoProps} />)

      const video = screen.getByText('Your browser does not support the video tag.').closest('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('autoPlay')
      expect(video).toHaveAttribute('loop')
      expect(video).toHaveAttribute('muted')
      expect(video).toHaveAttribute('playsInline')

      const source = video?.querySelector('source')
      expect(source).toHaveAttribute('src', '/video/sample.mp4')
      expect(source).toHaveAttribute('type', 'video/mp4')
    })

    it('should apply correct video styling', () => {
      render(<SectionWrapper {...videoProps} />)

      const video = screen.getByText('Your browser does not support the video tag.').closest('video')
      expect(video).toHaveClass(
        'video',
        'w-full',
        'h-full',
        'overflow-hidden',
        'rounded-tl-3xl',
        'rounded-tr-3xl',
        'object-cover'
      )
    })

    it('should render overlay text with video', () => {
      render(<SectionWrapper {...videoProps} />)

      expect(screen.getByText('We enable Collaborators')).toBeInTheDocument()
      expect(screen.getByText('to create delightful technical solutions')).toBeInTheDocument()
    })

    it('should apply correct overlay text styling', () => {
      render(<SectionWrapper {...videoProps} />)

      const overlayText = screen.getByText('We enable Collaborators').closest('h2')
      expect(overlayText).toHaveClass(
        'lg:text-4xl',
        'font-bold',
        'text-white',
        'p-4',
        'bg-black',
        'bg-opacity-50',
        'rounded-lg',
        'sm:text-lg'
      )
    })

    it('should not render default content when video is shown', () => {
      render(<SectionWrapper {...videoProps} />)

      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
      expect(screen.queryByText(/Placeholder content/)).not.toBeInTheDocument()
    })
  })

  describe('Default content rendering', () => {
    it('should render default content for unknown sections', () => {
      render(<SectionWrapper {...defaultProps} id="unknown" />)

      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Placeholder content for the Test Content section.')).toBeInTheDocument()
    })

    it('should render heading with correct styling', () => {
      render(<SectionWrapper {...defaultProps} />)

      const heading = screen.getByText('Test Content')
      expect(heading.tagName).toBe('H2')
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-4')
    })

    it('should render paragraph with correct styling', () => {
      render(<SectionWrapper {...defaultProps} />)

      const paragraph = screen.getByText(/Placeholder content/)
      expect(paragraph.tagName).toBe('P')
      expect(paragraph).toHaveClass('text-gray-700')
    })
  })

  describe('Conditional rendering logic', () => {
    it('should prioritize special sections over video', () => {
      render(
        <SectionWrapper
          {...defaultProps}
          id="People"
          videoSrc="/video/sample.mp4"
        />
      )

      expect(screen.getByTestId('people-section')).toBeInTheDocument()
      expect(screen.queryByText('Your browser does not support the video tag.')).not.toBeInTheDocument()
    })

    it('should prioritize video over default content', () => {
      render(
        <SectionWrapper
          {...defaultProps}
          id="unknown"
          videoSrc="/video/sample.mp4"
        />
      )

      expect(screen.getByText('Your browser does not support the video tag.')).toBeInTheDocument()
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    })

    it('should render default content when no special conditions are met', () => {
      render(<SectionWrapper {...defaultProps} id="unknown" />)

      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.queryByTestId('people-section')).not.toBeInTheDocument()
      expect(screen.queryByTestId('about-section')).not.toBeInTheDocument()
      expect(screen.queryByTestId('services-section')).not.toBeInTheDocument()
      expect(screen.queryByText('Your browser does not support the video tag.')).not.toBeInTheDocument()
    })
  })

  describe('Layout structure', () => {
    it('should have proper video container structure', () => {
      render(
        <SectionWrapper
          {...defaultProps}
          id="video"
          videoSrc="/video/sample.mp4"
        />
      )

      const videoContainer = screen.getByText('Your browser does not support the video tag.')
        .closest('.w-full.h-full')
      expect(videoContainer).toBeInTheDocument()

      const overlayContainer = screen.getByText('We enable Collaborators')
        .closest('.overlay-text')
      expect(overlayContainer).toHaveClass(
        'flex',
        'overlay-text',
        'lg:bottom-48',
        'p-4',
        'lg:relative',
        'md:flex'
      )
    })
  })
})