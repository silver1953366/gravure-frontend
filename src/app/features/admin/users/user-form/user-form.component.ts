import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router'; // <-- Importations du Router
import { CommonModule } from '@angular/common'; // <-- Importation correcte du CommonModule
import { UserService, User } from '../users.service';
import { take, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs'; // Pour gérer la souscription aux paramètres

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule], 
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
    
    userForm: FormGroup;
    currentUserId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    roles = ['admin', 'controller', 'client']; 
    private routeSubscription!: Subscription; // Pour nettoyer l'observable de la route

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        // Injection des services de routage
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
        // Utilisation de Params pour typer l'objet params
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            // Utilisation du type guard pour s'assurer que 'id' est un nombre
            this.currentUserId = params['id'] ? +params['id'] : null; 
            this.isEditMode = !!this.currentUserId;
            this.setupFormValidators();
            
            if (this.isEditMode) {
                this.loadUserData();
            }
        });
    }

    // Ajoutez ngOnDestroy pour éviter les fuites de mémoire (bonne pratique Angular)
    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }
    
    // ... (Le reste des méthodes setupFormValidators, loadUserData, patchForm, onSubmit est inchangé)
    setupFormValidators(): void {
        const passwordControl = this.userForm.controls['password'];
        
        if (!this.isEditMode) {
            passwordControl.setValidators([Validators.required, Validators.minLength(8)]);
        } else {
            passwordControl.setValidators([Validators.minLength(8)]);
        }
        passwordControl.updateValueAndValidity();
    }
    
    loadUserData(): void {
        this.isLoading = true;
        this.userService.getUsers().pipe(
            switchMap(users => {
                const user = users.find(u => u.id === this.currentUserId);
                if (user) {
                    this.patchForm(user);
                    return [user];
                }
                throw new Error("Utilisateur non trouvé");
            })
        ).subscribe({
            next: () => this.isLoading = false,
            error: (err) => {
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
        const data = this.userForm.value;

        if (this.isEditMode && !data.password) {
            delete data.password;
        }
        
        const request = this.isEditMode && this.currentUserId
            ? this.userService.updateUser(this.currentUserId, data)
            : this.userService.createUser(data);

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