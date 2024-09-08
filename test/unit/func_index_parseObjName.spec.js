const {parseObjName} = require('../../functions/index.js')
const {expect} = require('chai')

describe('parseObjName', () => {
    it('should parse a valid object name', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023/2023-03-13T19:25:41.041091~general~vaibhav~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('vaibhav');
      expect(date).to.equal('2023-03-13T19:25:41.041091');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with GPS', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023/2023-03-13T19:25:41.041091~general~vaibhav~_L3A3047.jpg~12.345678,98.765432'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('vaibhav');
      expect(date).to.equal('2023-03-13T19:25:41.041091');
      expect(gps).to.equal('12.345678,98.765432');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023/2023-03-13T19:25:41.041091~vaibhav~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('vaibhav');
      expect(date).to.equal('2023-03-13T19:25:41.041091');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no date', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023/~general~vaibhav~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('vaibhav');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no user', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023/2023-03-13T19:25:41.041091~general~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('2023-03-13T19:25:41.041091');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint and no user', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023/2023-03-13T19:25:41.041091~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('2023-03-13T19:25:41.041091');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, and no date', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
    it('should parse a valid object name with no waypoint, no user, no date, and no gps', () => {
      const [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(
        'uploads/werun2023~_L3A3047.jpg'
      );
      expect(folder).to.equal('uploads');
      expect(raceId).to.equal('werun2023');
      expect(waypoint).to.equal('general');
      expect(userId).to.equal('unknown');
      expect(date).to.equal('nodate');
      expect(gps).to.equal('');
      expect(fileName).to.equal('_L3A3047.jpg');
    });
  
})
  