import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { first } from 'rxjs/internal/operators/first';

import { environment } from '@environment';
import { User, UserClaim, UserInterface } from '@models/User';
import { FirebaseError } from '@utils/FirebaseError';
import { getDataFromDocument } from '@utils/getFirestoreData';
import { SuccessResponse } from '@models/Response';
import { auth } from 'firebase/app';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable()
export class AuthService {

  private dbFirestore: firebase.firestore.DocumentReference;
  private dbUsers: AngularFirestoreCollection;
  private dbUsersRoute: string;
  private apiUser: string;

  private user = new BehaviorSubject<User>(null);
  private userDoc = new BehaviorSubject<UserInterface>(null);
  private emailPhone = new BehaviorSubject<string>(null);
  private confirmationResult = new BehaviorSubject<auth.ConfirmationResult>(null);

  confirmationResult$ = this.confirmationResult.asObservable();
  user$: Observable<User> = this.user.asObservable();
  emailPhone$: Observable<string> = this.emailPhone.asObservable();
  userDoc$ = this.userDoc.asObservable();

  private userSubscription: Subscription;
  private userDocSubscription: Subscription;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private http: HttpClient) {
    const { api, db } = environment;
    const { url, user } = api;
    const { version, name, users } = db;
    this.dbFirestore = this.afs.firestore.collection(version).doc(name);
    this.dbUsers = this.afs.collection(version).doc(name).collection(users);
    this.apiUser = url + user;
    this.dbUsersRoute = users;
  }

  destroy() {
    this.unsubscribeUser();
  }

  unsubscribeUser() {
    if (this.userDocSubscription && !this.userDocSubscription.closed) {
      this.userDocSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  async getAfsCurrentUser() {
    try {
      return await this.afAuth.currentUser;
    } catch (err) {
      throw err.message;
    }
  }

  getCurrentUserStream() {
    return this.user$;
  }

  async getCurrentUser() {
    try {
      return await this.getCurrentUserStream().pipe(first()).toPromise();
    } catch (err) {
      throw err.message;
    }
  }

  getCurrentUserDocument() {
    return this.userDoc$;
  }

  getUserDocument() {
    this.userSubscription = this.getCurrentUserStream().subscribe(user => {
      if (user) {
        const { uid } = user;
        if (this.userDoc.value && this.userDoc.value.uid === uid) {
          return;
        }
        this.unsubscribeUser();
        const userPath = this.dbUsers.doc<UserInterface>(uid);
        this.userDocSubscription = getDataFromDocument(userPath).subscribe(userDoc => this.userDoc.next(userDoc));
      }
    });
  }

  async signIn(email: string, password: string) {
    try {
      return await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      throw err.message;
    }
  }

  async signInAnonymously() {
    try {
      return await this.afAuth.signInAnonymously();
    } catch (err) {
      throw err.message;
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new auth.GoogleAuthProvider();
      await this.afAuth.signInWithPopup(provider);
      await this.getUser();
    } catch (err) {
      throw err.message;
    }
  }

  async verifyOtp(otp: string) {
    try {
      const confirmationResult = await this.getConfirmationResult();
      return await confirmationResult.confirm(otp);
    } catch (err) {
      throw err.message;
    }
  }

  async signInWithPhone(phone: string, recaptchaVerifier: auth.RecaptchaVerifier) {
    try {
      this.confirmationResult.next(await this.afAuth.signInWithPhoneNumber(phone, recaptchaVerifier));
    } catch (err) {
      throw err.message;
    }
  }

  async linkUserToPhone(phoneNumber: string, recaptchaVerifier: auth.RecaptchaVerifier) {
    try {
      const user = await this.getAfsCurrentUser();
      return this.confirmationResult.next(await user.linkWithPhoneNumber(phoneNumber, recaptchaVerifier));
    } catch (err) {
      throw err;
    }
  }

  async linkUserToEmail(email: string, password: string) {
    try {
      const user = await this.getAfsCurrentUser();
      const credential = auth.EmailAuthProvider.credential(email, password);
      return user.linkWithCredential(credential);
    } catch (err) {
      throw err;
    }
  }

  async createPhoneUser() {
    try {
      const user = await this.getAfsCurrentUser();
      const headers = await this.setDefaultHeaders();
      const { uid } = user;
      const result = await this.http.patch<SuccessResponse>(`${this.apiUser}/${uid}/phone`, null, { headers }).toPromise();
      return result.data;
    } catch (err) {
      throw err;
    }
  }

  async createEmailUser() {
    try {
      const user = await this.getAfsCurrentUser();
      const headers = await this.setDefaultHeaders();
      const { uid } = user;
      const result = await this.http.patch<SuccessResponse>(`${this.apiUser}/${uid}/email`, null, { headers }).toPromise();
      return result.data;
    } catch (err) {
      throw err;
    }
  }

  async getUserByPhone(phone: string): Promise<UserInterface | null> {
    const { dbFirestore, dbUsersRoute } = this;
    const data = await dbFirestore.collection(dbUsersRoute).where('phone', '==', phone).limit(1).get();
    if (!data.empty) {
      return data.docs[0].data() as UserInterface;
    } else {
      return null;
    }
  }

  async fetchEmail(email: string) {
    try {
      return await this.afAuth.fetchSignInMethodsForEmail(email);
    } catch (err) {
      throw err.message;
    }
  }

  async signOut() {
    await this.afAuth.signOut();
  }

  setUser(user: User) {
    this.user.next(user);
  }

  setCurrentEmailPhone(emailPhone: string) {
    this.emailPhone.next(emailPhone);
  }

  async isUserAnonymous(): Promise<boolean> {
    const user = await this.isLoggedIn();
    return user.isAnonymous;
  }

  async getCurrentEmailPhone() {
    return await this.emailPhone$.pipe(first()).toPromise();
  }

  async getConfirmationResult() {
    return await this.confirmationResult$.pipe(first()).toPromise();
  }

  async setGroup(claims: UserClaim) {
    try {
        let user = await this.getCurrentUser();
        user = { ...user, ...claims };
        this.setUser(user);
    } catch (err) {
      throw err;
    }
  }

  async getUser() {
    try {
      let currentUser = await this.getAfsCurrentUser();
      if (!currentUser) {
        await this.signInAnonymously();
        currentUser = await this.getAfsCurrentUser();
      }
      const { displayName, email, phoneNumber, uid, isAnonymous } = currentUser;
      const { token, claims, expirationTime } = await currentUser.getIdTokenResult(true);
      const expiry = Date.parse(expirationTime);
      const authDetails = { uid, isAnonymous, token, name: displayName, email, phone: phoneNumber, expiry };
      if (claims.claims && claims.claims.length === 1) {
        const { shopId, role, } = claims.claims[0];
        this.setUser({ ...authDetails, shopId, role, allClaims: claims.claims });
      } else if (claims.claims && claims.claims.length > 1) {
        this.setUser({ ...authDetails, allClaims: claims.claims });
      } else {
        this.setUser({ ...authDetails });
      }
      return this.user$;
    } catch (err) {
      throw err.message;
    }
  }

  async isLoggedIn() {
    return await this.afAuth.authState.pipe(first()).toPromise();
  }

  async isAuthenticated() {
    const user = await this.isLoggedIn();
    if (user) {
      await this.getUser();
      return true;
    }
    return false;
  }

  async getAuthenticatedUser() {
    const authenticated = await this.isLoggedIn();
    if (!authenticated) { return false; }
    let user = await this.getCurrentUser();
    if (!user || user.uid !== authenticated.uid) {
      await this.getUser();
      user = await this.getCurrentUser();
    }
    return user;
  }

  async isShopUser() {
    const user = await this.getAuthenticatedUser();
    if (!user) {
      return false;
    } else if (user && user.role !== 'admin' && user.role !== 'staff') {
      return false;
    }
    return true;
  }

  async isAdmin() {
    const user = await this.getAuthenticatedUser();
    if (user && user.role !== 'admin') {
      return false;
    }
    return true;
  }

  async setPassword(code: string, password: string) {
    try {
      return await this.afAuth.confirmPasswordReset(code, password);
    } catch (err) {
      throw FirebaseError.Parse(err);
    }
  }

  async updatePassword(password: string) {
    try {
      await (await this.getAfsCurrentUser()).updatePassword(password);
    } catch (err) {
      throw err.message;
    }
  }

  async passwordReset(email: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (err) {
      throw err.message;
    }
  }

  async verifyEmail(code: string) {
    try {
      return await this.afAuth.applyActionCode(code);
    } catch (err) {
      throw err.message;
    }
  }

  async sendEmailVerification() {
    try {
      await (await this.getAfsCurrentUser()).sendEmailVerification();
    } catch (err) {
      throw err.message;
    }
  }

  getActionCodeSettings() {
    return {
      url: `${environment.url}/auth`,
      handleCodeInApp: true,
      // iOS: {
      //   bundleId: 'com.example.ios'
      // },
      // android: {
      //   packageName: 'com.example.android',
      //   installApp: true,
      //   minimumVersion: '12'
      // },
      // dynamicLinkDomain: 'example.page.link'
    };
  }

  private async setDefaultHeaders() {
    try {
        const user = await this.getCurrentUser();
        if (user.expiry < Date.now()) {
            await this.getUser();
        }
        const { token } = user;
        return {
            Authorization: `Bearer ${token}`
        };
    } catch (err) {
        throw err;
    }
  }

}
