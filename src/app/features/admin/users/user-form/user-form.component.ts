import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterLink } from '@angular/router'; // 🛑 Correction: Ajout de RouterLink
import { CommonModule } from '@angular/common';
import { UserService, User, UserPayload } from '../users.service'; 
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs'; 

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink], // 🛑 Correction: Ajout de RouterLink
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, OnDestroy {
    
    userForm: FormGroup;
    currentUserId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    roles = ['admin', 'controller', 'client']; 
    private routeSubscription!: Subscription;

    // 🛑 ID simulé de l'utilisateur connecté (Admin dans ce cas)
    private readonly CONNECTED_USER_ID = 1; 
    
    isOwnProfile = false; // Défini si l'ID du profil édité est le même que l'ID connecté

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute, 
        private router: Router 
    ) {
        this.userForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(255)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            password: [''], 
            role: ['client', Validators.required],
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentUserId = params['id'] ? +params['id'] : null; 
            this.isEditMode = !!this.currentUserId;
            
            // Déterminer si nous éditons notre propre profil
            this.isOwnProfile = this.isEditMode && this.currentUserId === this.CONNECTED_USER_ID;

            // Assurer la présence du contrôle 'password' avant la configuration
            if (!this.userForm.get('password')) {
                this.userForm.addControl('password', this.fb.control(''));
            }

            this.setupFormControls(); 
            
            if (this.isEditMode) {
                this.loadUserData(); // La méthode loadUserData est présente
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }
    
    /**
     * Configure dynamiquement les contrôles du formulaire selon le mode et l'utilisateur édité.
     */
    setupFormControls(): void {
        const nameControl = this.userForm.controls['name'];
        const emailControl = this.userForm.controls['email'];
        const passwordControl = this.userForm.controls['password'];

        if (this.isEditMode) {
            
            // --- 1. Contrôle du Nom & Email ---
            if (!this.isOwnProfile) {
                // Si on édite un autre utilisateur, Nom et Email sont désactivés
                nameControl.disable();
                emailControl.disable();
            } else {
                // Si c'est notre propre profil, tout est activé
                nameControl.enable();
                emailControl.enable();
            }

            // --- 2. Contrôle du Mot de passe ---
            if (this.isOwnProfile) {
                // Si c'est notre propre profil, le mot de passe est optionnel (min 8 si saisi)
                passwordControl.setValidators([Validators.minLength(8)]);
            } else {
                // Si on édite un autre utilisateur, le champ password est retiré (sécurité)
                passwordControl.clearValidators();
                this.userForm.removeControl('password');
            }
            
        } else {
            // Mode création: tout est enabled, password est requis
            nameControl.enable();
            emailControl.enable();
            passwordControl.setValidators([Validators.required, Validators.minLength(8)]);
        }
        
        this.userForm.updateValueAndValidity();
    }
    
    /** Récupère les données utilisateur pour l'édition (Résout TS2339) */
    loadUserData(): void {
        this.isLoading = true;
        
        this.userService.getUserById(this.currentUserId!).subscribe({
            next: (user: User) => {
                this.patchForm(user);
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error("Erreur lors du chargement des données utilisateur:", err);
                this.router.navigate(['/admin/users']); 
            }
        });
    }
    
    patchForm(user: User): void {
         this.userForm.patchValue({
             name: user.name,
             email: user.email,
             role: user.role,
             password: ''
         });
    }

    onSubmit(): void {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        
        // getRawValue() inclut les champs désactivés, ce qui est crucial pour le rôle
        let data: Partial<UserPayload> = this.userForm.getRawValue();

        if (this.isEditMode) {
            // Retirer les champs désactivés (Nom, Email) qui ne doivent pas être envoyés au backend
            if (!this.userForm.controls['name'].enabled) {
                delete data.name;
            }
            if (!this.userForm.controls['email'].enabled) {
                delete data.email;
            }
            
            // Gérer le mot de passe : S'il est présent (c'est notre profil) et vide, le retirer
            if (this.userForm.get('password')) {
                 if (!data.password) {
                     delete data.password;
                 }
            }
        }
        
        const request = this.isEditMode && this.currentUserId
            ? this.userService.updateUser(this.currentUserId, data)
            : this.userService.createUser(data as UserPayload);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/admin/users']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422 && err.error.errors) {
                    this.apiErrors = err.error.errors;
                } else {
                    this.apiErrors = { general: "Une erreur inattendue est survenue lors de la sauvegarde." };
                }
                console.error("Erreur API:", err);
            }
        });
    }
}