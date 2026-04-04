class Exoplanet {
  /** 
   * Kepler Identification or KepID 
   * 
   * Target identification number, as listed in the Kepler Input Catalog (KIC). The KIC was derived from a ground-based imaging survey of the Kepler field conducted prior to launch. The survey's purpose was to identify stars for the Kepler exoplanet survey by magnitude and color. The full catalog of 13 million sources can be searched at the MAST archive. The subset of  4 million targets found upon the Kepler CCDs can be searched via the  Kepler Target Search form. The Kepler ID is unique to a target and there is only one Kepler ID per target.
  */
  kepid: number;

  /** 
   * Kepler Name
   * 
   * Kepler number name in the form "Kepler-N," plus a lower-case letter, identifying the planet. In general, these numbers are easier to remember than the corresponding KOI or KIC/KepID designations and are intended to clearly indicate a class of objects that have been confirmed or validated as planets—a step up from the planet candidate designation.
  */
  kepler_name: string;
  
  /** 
   * KOI Name
   * 
   * A number used to identify and track a Kepler Object of Interest (KOI). A KOI is a target identified by the Kepler Project that displays at least one transit-like sequence within Kepler time-series photometry that appears to be of astrophysical origin and initially consistent with a planetary transit hypothesis. A KOI name has an integer and a decimal part of the format KNNNNN.DD. The integer part designates the target star; the two-digit decimal part identifies a unique transiting object associated with that star. It is not necessarily the planetary candidate listed in that order within a DV report, nor does it indicate the distance of the planet from the the host star relative to other planets in the system.
  */
  kepoi_name: string;
  
  /** 
   * KOI Comment
   * 
   * A description of the reason why an object's disposition has been given as false positive. The following keywords are shorthand for certain criterion used to determine if a KOI is a false positive: APO: "Active Pixel Offset" The pixels showing the transit do not coincide with the target star, indicating that the transit is actually on a background object. Binary: Indicates the transit event is due to an eclipsing binary, not a planet. EB: Target is an eclipsing binary, or there is an unresolved background binary. odd-even: The depth of the even-numbered transits are statistically different than the depths of the odd-numbered transits; this is a sign of a background eclipsing binary. V-shaped: Likely a grazing eclipsing binary. SB1: Target star is a single-lined spectroscopic binary. SB2: Target star is a double-lined spectroscopic binary. A comment field may also contain a list of the minor flags as set by the Robovetter. See the documents for the DR 25 and DR 24 Robovetter KOI Flags for detailed descriptions.
  */
  koi_comment: string;
  
  /**
   * Transit Depth (parts per million)
   * 
   * The fraction of stellar flux lost at the minimum of the planetary transit. Transit depths are typically computed from a best-fit model produced by a Mandel-Agol (2002) model fit to a multi-quarter Kepler light curve, assuming a linear orbital ephemeris.
   *
   * Uncertainties (+/-)
   * @Positive koi_depth_err1
   * @Negative koi_depth_err2
  */
  koi_depth: number;
  
  /**
   * Disposition Provenance
   * 
   * Disposition Provenance
  */
  koi_disp_prov: any;

  /**
   * Exoplanet Archive Disposition
   * 
   * The category of this KOI from the Exoplanet Archive. Current values are CANDIDATE, FALSE POSITIVE, NOT DISPOSITIONED or CONFIRMED. All KOIs marked as CONFIRMED are also listed in the Exoplanet Archive Confirmed Planet table. Designations of CANDIDATE, FALSE POSITIVE, and NOT DISPOSITIONED are taken from the Disposition Using Kepler Data.
  */
  koi_disposition: string;

  /**
   * Planet-Star Distance over Star Radius
   * 
   * The distance between the planet and the star at mid-transit divided by the stellar radius. For the case of zero orbital eccentricity, the distance at mid-transit is the semi-major axis of the planetary orbit.
   *
   * Uncertainties (+/-)
   *  @Positive koi_dor_err1
   *  @Negative koi_dor_err2
  */
  koi_dor: number;

  /**
   * Transit Duration (hours)
   * 
   * The duration of the observed transits. Duration is measured from first contact between the planet and star until last contact. Contact times are typically computed from a best-fit model produced by a Mandel-Agol (2002) model fit to a multi-quarter Kepler light curve, assuming a linear orbital ephemeris.
   *
   * Uncertainties (+/-)
   *  @Positive koi_duration_err1
   *  @Negative koi_duration_err2
  */
  koi_duration: number;

  /**
   * Eccentricity
   * 
   * Eccentricity Value
   * 
   * Uncertainties (+/-)
   *  @Positive koi_eccen_err1
   *  @Negative koi_eccen_err2
  */
  koi_eccen: number;

  /**
   * Planetary Fit Type
   * 
   * Type of Fit for planetary parameters. Options are: 
   * 
   * - LS (Least Squares fit)
   * - MCMC (Markov Chain Monte Carlo fit) 
   * - DV (Data Validation pipeline fit)  
   * - none (fit is not provided, only orbital period, transit epoch and transit duration are reported) LS+MCMC (Least Squares Fit with Markov Monte Carlo error bars)
  */
  koi_fittype: string;

  /**
   * Centroid Offset Flag
   * 
   * The source of the signal is from a nearby star, as inferred by measuring the centroid location of the image both in and out of transit, or by the strength of the transit signal in the target's outer (halo) pixels as compared to the transit signal from the pixels in the optimal (or core) aperture.
  */
  koi_fpflag_co: number;

  /**
   * Ephemeris Match Indicates Contamination Flag
   * 
   * The KOI shares the same period and epoch as another object and is judged to be the result of flux contamination in the aperture or electronic crosstalk.
  */
  koi_fpflag_ec: boolean;

  /**
   * Not Transit-Like Flag
   * 
   * A KOI whose light curve is not consistent with that of a transiting planet. This includes, but is not limited to, instrumental artifacts, non-eclipsing variable stars, and spurious (very low SNR) detections.
  */
  koi_fpflag_nt: boolean;
  
  /**
   * Stellar Eclipse Flag
   * 
   * A KOI that is observed to have a significant secondary event, transit shape, or out-of-eclipse variability, which indicates that the transit-like event is most likely caused by an eclipsing binary. However, self-luminous, hot Jupiters with a visible secondary eclipse will also have this flag set, but with a disposition of PC.
  */
  koi_fpflag_ss: boolean;

  /**
   * Impact Parameter
   * 
   * The sky-projected distance between the center of the stellar disc and the center of the planet disc at conjunction, normalized by the stellar radius.
   *
   * Uncertainties (+/-)
   *  @Positive koi_impact_err1
   *  @Negative koi_impact_err2
  */
  koi_impact: number;

  /**
   * Inclination (deg)
   * 
   * The angle between the plane of the sky (perpendicular to the line of sight) and the orbital plane of the planet candidate.
   *
   * Uncertainties (+/-)
   *  @Positive koi_incl_err1
   *  @Negative koi_incl_err2
  */
  koi_incl: number;

  /**
   * Ingress Duration (hours)
   * 
   * The time between first and second contact of the planetary transit. Contact times are typically computed from a best-fit model produced by a Mandel-Agol (2002) model fit to a multi-quarter Kepler light curve, assuming a linear orbital ephemeris.
   *
   * Uncertainties (+/-)
   *  @Positive koi_ingress_err1
   *  @Negative koi_ingress_err2
  */
  koi_ingress: number;

  /**
   * Insolation Flux [Earth flux]
   * 
   * Insolation flux is another way to give the equilibrium temperature. It depends on the stellar parameters (specifically the stellar radius and temperature), and on the semi-major axis of the planet. It's given in units relative to those measured for the Earth from the Sun.
  */
  koi_insol: any;

  /**
   * Limb Darkening Coefficient (a1)
   * 
   * Up to four coefficients (a1, a2, a3, a4) that define stellar limb darkening (e.g., Claret 2000). Limb darkening is the variation of specific intensity of the star as a function of μ = cos(θ). θ is the angle between the line-of-sight of an observer and a line perpendicular to the stellar surface at an observed point. Coefficients are dependent upon stellar temperature, surface gravity and metallicity. Adopted coefficients are required input for Mandel-Agol (2002) fits and are  extracted from archived tables (e.g.,  Claret and Bloemen 2011). Limb-darkening coefficients remain fixed during fit minimization. Note that the dependence of limb-darkening coefficients on stellar parameters implies that planet radius does not scale linearly with stellar radius. If new stellar parameters are adopted, the most-correct approach is to re-fit the transit with new limb-darkening coefficients in order to re-measure planet size.
  */
  koi_ldm_coeff1: string;

  /**
   * Limb Darkening Coefficient (a2)
   * 
   * Up to four coefficients (a1, a2, a3, a4) that define stellar limb darkening (e.g., Claret 2000). Limb darkening is the variation of specific intensity of the star as a function of μ = cos(θ). θ is the angle between the line-of-sight of an observer and a line perpendicular to the stellar surface at an observed point. Coefficients are dependent upon stellar temperature, surface gravity and metallicity. Adopted coefficients are required input for Mandel-Agol (2002) fits and are  extracted from archived tables (e.g.,  Claret and Bloemen 2011). Limb-darkening coefficients remain fixed during fit minimization. Note that the dependence of limb-darkening coefficients on stellar parameters implies that planet radius does not scale linearly with stellar radius. If new stellar parameters are adopted, the most-correct approach is to re-fit the transit with new limb-darkening coefficients in order to re-measure planet size.
  */
  koi_ldm_coeff2: string;
  
  /**
   * Limb Darkening Coefficient (a3)
   * 
   * Up to four coefficients (a1, a2, a3, a4) that define stellar limb darkening (e.g., Claret 2000). Limb darkening is the variation of specific intensity of the star as a function of μ = cos(θ). θ is the angle between the line-of-sight of an observer and a line perpendicular to the stellar surface at an observed point. Coefficients are dependent upon stellar temperature, surface gravity and metallicity. Adopted coefficients are required input for Mandel-Agol (2002) fits and are  extracted from archived tables (e.g.,  Claret and Bloemen 2011). Limb-darkening coefficients remain fixed during fit minimization. Note that the dependence of limb-darkening coefficients on stellar parameters implies that planet radius does not scale linearly with stellar radius. If new stellar parameters are adopted, the most-correct approach is to re-fit the transit with new limb-darkening coefficients in order to re-measure planet size.
  */
  koi_ldm_coeff3: string;

  /**
   * Limb Darkening Coefficient (a4)
   * 
   * Up to four coefficients (a1, a2, a3, a4) that define stellar limb darkening (e.g., Claret 2000). Limb darkening is the variation of specific intensity of the star as a function of μ = cos(θ). θ is the angle between the line-of-sight of an observer and a line perpendicular to the stellar surface at an observed point. Coefficients are dependent upon stellar temperature, surface gravity and metallicity. Adopted coefficients are required input for Mandel-Agol (2002) fits and are  extracted from archived tables (e.g.,  Claret and Bloemen 2011). Limb-darkening coefficients remain fixed during fit minimization. Note that the dependence of limb-darkening coefficients on stellar parameters implies that planet radius does not scale linearly with stellar radius. If new stellar parameters are adopted, the most-correct approach is to re-fit the transit with new limb-darkening coefficients in order to re-measure planet size.
  */
  koi_ldm_coeff4: string;

  /**
   * Limb Darkening Model Name
   * 
   * A reference to the limb-darkening model used to calculate stellar limb-darkening coefficients.
  */
  koi_limbdark_mod: string;

  /**
   * Long. of Periastron (deg)
   * 
   * Longitude of Periastron
   *
   * Uncertainties (+/-)
   *  @Positive koi_longp_err1
   *  @Negative koi_longp_err2
  */
  koi_longp: number;

  /**
   * KOI Parameter Provenance
   * 
   * KOI Parameter Provenance
  */
  koi_parm_prov: number;

  /**
   * Disposition Using Kepler Data
   * 
   * The pipeline flag that designates the most probable physical explanation of the KOI. Typical values are FALSE POSITIVE, NOT DISPOSITIONED, and CANDIDATE. The value of this flag may change over time as the evaluation of KOIs proceeds to deeper levels of analysis using Kepler time-series pixel and light curve data, or follow-up observations. A not dispositioned value corresponds to objects for which the disposition tests have not yet been completed. A false positive has failed at least one of the tests described in Batalha et al. (2012). A planetary candidate has passed all prior tests conducted to identify false positives, although this does not a priori mean that all possible tests have been conducted. A future test may confirm this KOI as a false positive.  False positives can occur when: 1) the KOI is in reality an eclipsing binary star, 2) the Kepler light curve is contaminated by a background eclipsing binary, 3) stellar variability is confused for coherent planetary transits, or 4) instrumental artifacts are confused for coherent planetary transits.
  */
  koi_pdisposition: string;

  /**
   * Orbital Period (days)
   * 
   * The interval between consecutive planetary transits.
   *
   * Uncertainties (+/-)
   *  @Positive koi_period_err1
   *  @Negative koi_period_err2
  */
  koi_period: number;

  /**
   * Planetary Radius (Earth radii)
   * 
   * The radius of the planet. Planetary radius is the product of the planet star radius ratio and the stellar radius.
   * 
   * Uncertainties (+/-)
   *  @Positive koi_prad_err1
   *  @Negative koi_prad_err2
  */
  koi_prad: number;

  /**
   * Planet-Star Radius Ratio
   * 
   * The planet radius divided by the stellar radius.
   * Uncertainties (+/-)
   *  @Positive koi_ror_err1
   *  @Negative koi_ror_err2
  */
  koi_ror: number;

  /**
   * Disposition Score
   * 
   * A value between 0 and 1 that indicates the confidence in the KOI disposition. For CANDIDATEs, a higher value indicates more confidence in its disposition, while for FALSE POSITIVEs, a higher value indicates less confidence in that disposition. The value is calculated from a Monte Carlo technique such that the score's value is equivalent to the frction of iterations where the Robovetter yields a disposition of CANDIDATE.
  */
  koi_score: number;

  /**
   * Orbit Semi-Major Axis (Astronomical Unit (au))
   * 
   * Half of the long axis of the ellipse defining a planet's orbit. For a circular orbit this is the planet-star separation radius. The semi-major axis is derived based on Kepler's third law, i.e., utilizing the orbital period and stellar mass, not scaling the planet-star separation by the stellar radius.
   *
   * Uncertainties (+/-)
   *  @Positive koi_sma_err1
   *  @Negative koi_sma_err2
  */
  koi_sma: number;

  /**
   * Fitted Stellar Density [g/cm*3]
   * 
   * Fitted stellar density is a direct observable from the light curve that, in the small-planet approximation, depends only on the transit's period, depth, and  duration (see Seager and Mallen-Ornelas 2003).  This quantity is directly fitted in the LS and MCMC methods, and is completely independent from the listed stellar mass and radius, which are derived  using ground-based photometry, spectroscopy, and  other observations.
   *
   * Uncertainties (+/-)
   *  @Positive koi_srho_err1
   *  @Negative koi_srho_err2
  */
  koi_srho: number;

  /**
   * Equilibrium Temperature (Kelvin)
   * 
   * Approximation for the temperature of the planet. The calculation of equilibrium temperature assumes a) thermodynamic equilibrium between the incident stellar flux and the radiated heat from the planet, b) a Bond albedo (the fraction of total power incident upon the planet scattered back into space) of 0.3, c) the planet and star are blackbodies, and d) the heat is evenly distributed between the day and night sides of the planet.
   *
   * Uncertainties (+/-)
   *  @Positive koi_teq_err1
   *  @Negative koi_teq_err2
  */
  koi_teq: number;

  /**
   * Transit Epoch in BJD
   * 
   * The time corresponding to the center of the first detected transit in Barycentric Julian Day (BJD).
   *
   * Uncertainties (+/-)
   *  @Positive koi_time0_err1
   *  @Negative koi_time0_err2
  */
  koi_time0: number;

  /**
   * Transit Epoch (BJD - 2,454,833.0)
   * 
   * The time corresponding to the center of the first detected transit in Barycentric Julian Day (BJD) minus a constant offset of 2,454,833.0 days. The offset corresponds to 12:00 on Jan 1, 2009 UTC.
   *
   * Uncertainties (+/-)
   *  @Positive koi_time0bk_err1
   *  @Negative koi_time0bk_err2
  */
  koi_time0bk: number;

  /**
   * Date of Last Parameter Update
   * 
   * Date of the last parameter update for this KOI.
  */
  koi_vet_date: Date;
  
  /**
   * Vetting Status
   * 
   * The vetting status for this KOI delivery. Current possible states are ACTIVE and DONE. As vetting tests for the null hypothesis that a TCE is a planet are performed, the disposition of each KOI as either a planet candidate or false positive will be updated and, most importantly, may change over time. It is therefore critical that the scientific community not conduct sample completeness studies on KOI tables that remain ACTIVE. Active tables do, however, provide the latest information for community scientists interested in follow-up observations and disposition activities. After a period of  activity, the classification of the KOI table will change  from ACTIVE to DONE when all dispositions are judged as  final and all model parameters have been updated appropriately.  This will typically occur after a new delivery of TCEs to  the archive based on a longer data baseline.
  */
  koi_vet_stat: string;

  constructor(planetData: object) {
    this.
  }
}