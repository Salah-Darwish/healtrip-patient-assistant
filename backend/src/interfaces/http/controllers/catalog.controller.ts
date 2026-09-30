import { Request, Response, NextFunction } from 'express';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface.js';
import { IHospitalRepository } from '../../../domain/repositories/hospital.repository.interface.js';

export class CatalogController {
  constructor(
    private readonly doctorRepo: IDoctorRepository,
    private readonly hospitalRepo: IHospitalRepository
  ) {}

  public getDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { specialty, countryCode, acceptsSecondOpinion, search } = req.query;

      const doctors = await this.doctorRepo.search({
        specialty: specialty as string,
        countryCode: countryCode as string,
        acceptsSecondOpinion: acceptsSecondOpinion !== undefined ? acceptsSecondOpinion === 'true' : undefined,
        searchQuery: search as string,
      });

      res.json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
      next(err);
    }
  };

  public getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await this.doctorRepo.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
      }
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  };

  public getHospitals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { countryCode, city, hasEmergency, search } = req.query;

      const hospitals = await this.hospitalRepo.search({
        countryCode: countryCode as string,
        city: city as string,
        hasEmergencyOnly: hasEmergency !== undefined ? hasEmergency === 'true' : undefined,
        searchQuery: search as string,
      });

      res.json({ success: true, count: hospitals.length, data: hospitals });
    } catch (err) {
      next(err);
    }
  };

  public getHospitalById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hosp = await this.hospitalRepo.findById(req.params.id);
      if (!hosp) {
        return res.status(404).json({ success: false, error: { message: 'Hospital not found' } });
      }
      res.json({ success: true, data: hosp });
    } catch (err) {
      next(err);
    }
  };

  public getCountries = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const countries = await this.hospitalRepo.getAllCountries();
      res.json({ success: true, data: countries });
    } catch (err) {
      next(err);
    }
  };

  public getSpecialties = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const specialties = await this.doctorRepo.getAllSpecialties();
      res.json({ success: true, data: specialties });
    } catch (err) {
      next(err);
    }
  };
}
