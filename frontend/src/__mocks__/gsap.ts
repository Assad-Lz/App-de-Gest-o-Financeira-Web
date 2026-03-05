const mockGsap = {
  fromTo: jest.fn(),
  to: jest.fn(),
  from: jest.fn(),
  set: jest.fn(),
  registerPlugin: jest.fn(),
  timeline: jest.fn(() => ({
    fromTo: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  })),
};

export default mockGsap;
export const gsap = mockGsap;
