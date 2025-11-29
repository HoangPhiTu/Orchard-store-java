# 📋 Coding Standards - Complete Guide

**Project:** Orchard Store E-Commerce Platform  
**Last Updated:** November 29, 2025  
**Scope:** Full Stack Development Standards

---

## 📚 Table of Contents

1. [Golden Rules](#golden-rules)
2. [Frontend Standards](#frontend-standards)
3. [Backend Standards](#backend-standards)
4. [Database Standards](#database-standards)
5. [Documentation Standards](#documentation-standards)
6. [Git Standards](#git-standards)
7. [Testing Standards](#testing-standards)
8. [Security Standards](#security-standards)

---

## 🎯 Golden Rules

### **Core Principles**

1. **Readability First** - Code should be easy to read and understand
2. **Consistency** - Follow established patterns across the codebase
3. **Simplicity** - Keep solutions simple and direct
4. **Performance** - Write efficient code without sacrificing readability
5. **Security** - Always consider security implications

### **Quick Reference**

| Area                     | Pattern                            | Example                                                |
| ------------------------ | ---------------------------------- | ------------------------------------------------------ |
| **API Calls**            | Component → Hook → Service → Axios | `useUsers()` → `userService.getUsers()` → `http.get()` |
| **Server State**         | TanStack Query                     | `useQuery()`, `useAppMutation()`                       |
| **Client State**         | Zustand                            | `useAuthStore()`, `useUIStore()`                       |
| **Forms**                | react-hook-form + Zod              | `useForm({ resolver: zodResolver(schema) })`           |
| **Error Handling**       | useAppMutation (auto)              | `setError: form.setError` → Auto assign errors         |
| **Styling**              | Tailwind CSS                       | `className="flex gap-4 rounded-lg"`                    |
| **Backend Architecture** | Modular Monolith                   | `modules/auth`, `modules/product`                      |
| **Data Access**          | JPA Repository                     | `UserRepository extends JpaRepository`                 |
| **DTOs**                 | MapStruct                          | `@Mapper UserMapper`                                   |
| **Validation**           | Bean Validation                    | `@Email`, `@NotNull`, `@Size`                          |
| **Security**             | JWT + RBAC                         | Hierarchy levels (1-10)                                |
| **Migrations**           | Flyway                             | `V1__init_schema.sql`                                  |

---

## 🎨 Frontend Standards

### **1. File & Folder Naming**

#### **✅ DO: Use kebab-case**

```
src/
├── components/
│   ├── shared/
│   │   ├── button.tsx
│   │   ├── input-field.tsx
│   │   └── data-table.tsx
│   ├── features/
│   │   ├── users/
│   │   │   ├── user-table.tsx
│   │   │   ├── user-form.tsx
│   │   │   └── user-types.ts
│   │   └── products/
│       ├── product-list.tsx
│       ├── product-form.tsx
│       └── product-types.ts
├── hooks/
│   ├── use-users.ts
│   ├── use-products.ts
│   └── use-auth.ts
├── services/
│   ├── api/
│   │   ├── users.service.ts
│   │   └── products.service.ts
│   └── auth.service.ts
├── lib/
│   ├── utils/
│   │   ├── cn.ts
│   │   └── date-formatter.ts
│   └── constants/
│       └── api-routes.ts
```

#### **❌ DON'T: Use camelCase or PascalCase for files**

```
src/
├── components/
│   ├── UserTable.tsx      // ❌ Wrong
│   ├── userTable.tsx      // ❌ Wrong
│   └── user-table.tsx     // ✅ Correct
```

### **2. Component Patterns**

#### **2.1 Functional Components with TypeScript**

```typescript
// ✅ Correct: Functional component with proper typing
interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
}: UserTableProps) {
  // Component implementation
  return <div className="space-y-4">{/* JSX content */}</div>;
}

// ✅ Correct: With memo for performance optimization
export const UserRow = React.memo<UserRowProps>(
  ({ user, onEdit, onDelete }) => {
    return <TableRow>{/* Row content */}</TableRow>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.status === nextProps.user.status
    );
  }
);
```

#### **2.2 Custom Hooks Pattern**

```typescript
// ✅ Correct: Custom hook with proper naming and typing
interface UseUsersOptions {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, pageSize = 10, searchTerm = "" } = options;

  return useQuery({
    queryKey: ["users", { page, pageSize, searchTerm }],
    queryFn: () => userService.getUsers({ page, pageSize, searchTerm }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
}

// ✅ Correct: Mutation hook with optimistic updates
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData(["users"]);

      queryClient.setQueryData(["users"], (old: User[] | undefined) => {
        return old ? [...old, newUser] : [newUser];
      });

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(["users"], context?.previousUsers);
      toast.error("Failed to create user: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### **3. Forms & Validation**

#### **3.1 React Hook Form + Zod Pattern**

```typescript
// ✅ Correct: Schema definition with Zod
const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["USER", "ADMIN", "MANAGER"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  phone: z
    .string()
    .regex(/^0[0-9]{9,10}$/, "Invalid phone number")
    .optional(),
});

type UserFormData = z.infer<typeof userSchema>;

// ✅ Correct: Form component with proper error handling
export function UserForm({ user, onSuccess }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      status: "ACTIVE",
    },
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        await updateUser.mutateAsync({ id: user.id, data });
      } else {
        await createUser.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Other fields */}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {user ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

### **4. API Integration**

#### **4.1 Service Layer Pattern**

```typescript
// ✅ Correct: Service layer with proper typing and error handling
export interface UserService {
  getUsers(filters: UserFilters): Promise<Page<User>>;
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserRequest): Promise<User>;
  updateUser(id: number, data: UpdateUserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

export const userService: UserService = {
  getUsers: async (filters) => {
    try {
      const response = await apiClient.get<Page<User>>("/admin/users", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  getUser: async (id) => {
    try {
      const response = await apiClient.get<User>(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },

  createUser: async (data) => {
    try {
      const response = await apiClient.post<User>("/admin/users", data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error("Invalid user data");
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put<User>(`/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  deleteUser: async (id) => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },
};
```

### **5. State Management**

#### **5.1 Zustand Store Pattern**

```typescript
// ✅ Correct: Zustand store with TypeScript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("auth_token"),
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      const { user, token } = response;

      localStorage.setItem("auth_token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const response = await authService.refreshToken(token);
      const { token: newToken } = response;

      localStorage.setItem("auth_token", newToken);
      set({ token: newToken });
    } catch (error) {
      get().logout();
    }
  },
}));

// ✅ Correct: Persistent store
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarOpen: true,
      notifications: [],

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: "ui-store",
    }
  )
);
```

### **6. Styling Standards**

#### **6.1 Tailwind CSS Patterns**

```typescript
// ✅ Correct: Consistent class naming and organization
export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg">{user.fullName}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {user.email}
            </CardDescription>
          </div>

          <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <StatusBadge status={user.status} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Edit
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ✅ Correct: Utility functions for consistent styling
export function getRoleBadgeVariant(
  role: string
): "default" | "secondary" | "destructive" | "outline" {
  const roleUpper = role.toUpperCase();
  if (roleUpper.includes("ADMIN")) return "destructive";
  if (roleUpper.includes("MANAGER")) return "default";
  return "secondary";
}

export function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    case "BANNED":
      return "destructive";
    default:
      return "outline";
  }
}
```

---

## ☕ Backend Standards

### **1. Package Structure**

#### **✅ Correct: Modular Monolith Structure**

```
src/main/java/com/orchard/orchard_store_backend/
├── OrchardStoreBackendApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── DataInitializer.java
│   └── properties/
│       ├── AppProperties.java
│       └── JwtProperties.java
├── exception/
│   └── GlobalExceptionHandler.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── modules/
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── dto/
│   │   │   ├── AuthRequestDTO.java
│   │   │   ├── AuthResponseDTO.java
│   │   │   └── ChangePasswordDTO.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   └── LoginHistory.java
│   │   ├── mapper/
│   │   │   └── UserMapper.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   └── LoginHistoryRepository.java
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── AuthServiceImpl.java
│   │       ├── LoginHistoryService.java
│   │       └── LoginHistoryServiceImpl.java
│   └── catalog/
│       ├── product/
│       │   ├── controller/ProductController.java
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── mapper/
│       │   ├── repository/
│       │   └── service/
│       └── brand/
│           ├── controller/BrandController.java
│           ├── dto/
│           ├── entity/
│           ├── mapper/
│           ├── repository/
│           └── service/
└── util/
    └── UserAgentParser.java
```

### **2. Entity Standards**

#### **2.1 JPA Entity Pattern**

```java
// ✅ Correct: Entity with proper annotations and relationships
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoginHistory> loginHistories = new ArrayList<>();

    // Constructors
    public User() {}

    public User(String email, String password, String fullName) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // ... other getters and setters

    // Business methods
    public boolean isAccountNonLocked() {
        return accountLockedUntil == null || accountLockedUntil.isBefore(LocalDateTime.now());
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.accountLockedUntil = null;
    }

    public void lockAccount(Duration lockDuration) {
        this.accountLockedUntil = LocalDateTime.now().plus(lockDuration);
    }
}
```

#### **2.2 DTO Pattern**

```java
// ✅ Correct: DTO with proper validation
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
    private String fullName;

    @Pattern(regexp = "^0[0-9]{9,10}$", message = "Invalid phone number format")
    private String phoneNumber;

    @NotNull(message = "Role is required")
    private UserRole role;

    @NotNull(message = "Status is required")
    private UserStatus status = UserStatus.ACTIVE;
}

// ✅ Correct: Response DTO with proper field mapping
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method for conversion
    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhoneNumber(),
            user.getRole(),
            user.getStatus(),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
```

#### **2.3 MapStruct Mapper Pattern**

```java
// ✅ Correct: MapStruct mapper with proper configuration
@Mapper(componentModel = "spring", uses = {})
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "loginHistories", ignore = true)
    User toEntity(CreateUserRequestDTO dto);

    @Mapping(target = "password", ignore = true)
    UserResponseDTO toResponseDTO(User user);

    @Mapping(target = "password", ignore = true)
    List<UserResponseDTO> toResponseDTOList(List<User> users);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "loginHistories", ignore = true)
    void updateEntityFromDTO(UpdateUserRequestDTO dto, @MappingTarget User user);
}
```

### **3. Service Layer Pattern**

#### **3.1 Service Interface**

```java
// ✅ Correct: Service interface with clear method signatures
public interface UserService {

    Page<UserResponseDTO> getUsers(UserFilters filters, Pageable pageable);

    UserResponseDTO getUserById(Long id);

    UserResponseDTO createUser(CreateUserRequestDTO request);

    UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request);

    void deleteUser(Long id);

    void changePassword(Long userId, ChangePasswordRequest request);

    void resetFailedLoginAttempts(Long userId);

    void lockUserAccount(Long userId, Duration lockDuration);

    boolean isEmailAvailable(String email);

    List<UserResponseDTO> searchUsers(String searchTerm);
}
```

#### **3.2 Service Implementation**

```java
// ✅ Correct: Service implementation with proper error handling
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsers(UserFilters filters, Pageable pageable) {
        Specification<User> spec = UserSpecification.withFilters(filters);
        Page<User> users = userRepository.findAll(spec, pageable);

        return users.map(userMapper::toResponseDTO);
    }

    @Override
    public UserResponseDTO createUser(CreateUserRequestDTO request) {
        // Validate email uniqueness
        if (!isEmailAvailable(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        // Create user entity
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save user
        User savedUser = userRepository.save(user);

        // Publish event
        eventPublisher.publishEvent(new UserCreatedEvent(savedUser));

        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));

        // Update entity from DTO
        userMapper.updateEntityFromDTO(request, user);

        // Save updated user
        User updatedUser = userRepository.save(user);

        return userMapper.toResponseDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));

        // Soft delete by updating status
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);

        // Publish event
        eventPublisher.publishEvent(new UserDeletedEvent(user));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> searchUsers(String searchTerm) {
        List<User> users = userRepository.searchUsers(searchTerm);
        return userMapper.toResponseDTOList(users);
    }
}
```

### **4. Controller Pattern**

#### **4.1 REST Controller**

```java
// ✅ Correct: REST controller with proper validation and error handling
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status) {

        UserFilters filters = UserFilters.builder()
            .searchTerm(searchTerm)
            .role(role)
            .status(status)
            .build();

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort[0]).descending());

        Page<UserResponseDTO> users = userService.getUsers(filters, pageable);

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(
            @Valid @RequestBody CreateUserRequestDTO request) {

        UserResponseDTO createdUser = userService.createUser(request);

        URI location = URI.create(String.format("/api/admin/users/%d", createdUser.getId()));
        return ResponseEntity.created(location).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request) {

        UserResponseDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponseDTO>> searchUsers(
            @RequestParam String searchTerm) {

        List<UserResponseDTO> users = userService.searchUsers(searchTerm);
        return ResponseEntity.ok(users);
    }
}
```

### **5. Exception Handling**

#### **5.1 Custom Exceptions**

```java
// ✅ Correct: Custom exception with proper error code
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("User not found with id: " + id);
    }

    public UserNotFoundException(String message) {
        super(message);
    }
}

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyExistsException extends RuntimeException {

    private final String email;

    public EmailAlreadyExistsException(String email) {
        super("Email already exists: " + email);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
```

#### **5.2 Global Exception Handler**

```java
// ✅ Correct: Global exception handler with proper error response format
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường sau:")
            .errors(errors)
            .path(getCurrentPath())
            .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(
            UserNotFoundException ex) {

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("User Not Found")
            .message(ex.getMessage())
            .path(getCurrentPath())
            .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExistsException(
            EmailAlreadyExistsException ex) {

        Map<String, String> errors = Map.of("email", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.CONFLICT.value())
            .error("Email Already Exists")
            .message("Email đã được sử dụng bởi tài khoản khác")
            .errors(errors)
            .path(getCurrentPath())
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {

        log.error("Unexpected error occurred", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.")
            .path(getCurrentPath())
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    private String getCurrentPath() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes) {
            return ((ServletRequestAttributes) attributes).getRequest().getRequestURI();
        }
        return "";
    }
}
```

---

## 🗄️ Database Standards

### **1. Naming Conventions**

#### **1.1 Table Naming**

```sql
-- ✅ Correct: Use snake_case, plural nouns
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ Wrong: camelCase or singular names
CREATE TABLE User (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES User(id)
);
```

#### **1.2 Column Naming**

```sql
-- ✅ Correct: Use snake_case, descriptive names
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    brand_id BIGINT REFERENCES brands(id),
    category_id BIGINT REFERENCES categories(id),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ Wrong: camelCase or abbreviated names
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    productName VARCHAR(255) NOT NULL,
    basePrice DECIMAL(10,2) NOT NULL,
    brandID BIGINT REFERENCES brands(id),
    isFeat BOOLEAN DEFAULT FALSE
);
```

### **2. Indexing Strategy**

#### **2.1 Primary Indexes**

```sql
-- ✅ Correct: Primary key constraints
ALTER TABLE products ADD CONSTRAINT pk_products PRIMARY KEY (id);
ALTER TABLE product_variants ADD CONSTRAINT pk_product_variants PRIMARY KEY (id);
```

#### **2.2 Foreign Key Indexes**

```sql
-- ✅ Correct: Index foreign key columns
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

#### **2.3 Query Optimization Indexes**

```sql
-- ✅ Correct: Indexes for common queries
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ✅ Correct: Composite indexes for multi-column queries
CREATE INDEX idx_products_brand_category ON products(brand_id, category_id);
CREATE INDEX idx_products_status_featured ON products(status, is_featured);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

#### **2.4 Full-Text Search Indexes**

```sql
-- ✅ Correct: Full-text search indexes
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_brands_search ON brands USING gin(to_tsvector('english', name || ' ' || description));
```

### **3. Migration Standards**

#### **3.1 Flyway Migration Naming**

```sql
-- ✅ Correct: Versioned migration files
-- V1__init_schema.sql
-- V2__add_user_roles.sql
-- V3__create_products_table.sql
-- V4__add_product_indexes.sql

-- ✅ Correct: Repeatable migrations
-- R__insert_default_data.sql
-- R__create_functions.sql
-- R__create_views.sql
```

#### **3.2 Migration Structure**

```sql
-- ✅ Correct: Well-structured migration
-- V3__create_products_table.sql

-- Create products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    brand_id BIGINT REFERENCES brands(id),
    category_id BIGINT REFERENCES categories(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_slug ON products(slug);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📝 Documentation Standards

### **1. Code Comments**

#### **1.1 JavaDoc Standards**

```java
/**
 * Service for managing user accounts and authentication.
 *
 * <p>This service provides CRUD operations for users, password management,
 * and account security features such as login attempt tracking and account locking.</p>
 *
 * @author Orchard Store Team
 * @version 1.0
 * @since 2025-01-01
 */
@Service
public class UserServiceImpl implements UserService {

    /**
     * Creates a new user account with the provided details.
     *
     * <p>This method performs the following operations:</p>
     * <ul>
     *   <li>Validates email uniqueness</li>
     *   <li>Encodes the password using BCrypt</li>
     *   <li>Saves the user to the database</li>
     *   <li>Publishes a UserCreatedEvent</li>
     * </ul>
     *
     * @param request the user creation request containing email, password, and other details
     * @return the created user response DTO
     * @throws EmailAlreadyExistsException if the email is already in use
     * @throws ValidationException if the request data is invalid
     * @see UserCreatedEvent
     * @see PasswordEncoder
     */
    @Override
    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO request) {
        // Implementation
    }
}
```

#### **1.2 TypeScript Comments**

````typescript
/**
 * Custom hook for managing user data with React Query.
 *
 * Provides functionality for fetching, creating, updating, and deleting users
 * with automatic caching, error handling, and optimistic updates.
 *
 * @example
 * ```typescript
 * const { data: users, loading, error } = useUsers({ page: 0, pageSize: 10 });
 * const createUser = useCreateUser();
 * ```
 */
export function useUsers(options: UseUsersOptions = {}) {
  // Implementation
}

/**
 * Props for the UserTable component.
 *
 * @interface UserTableProps
 * @property {User[]} users - Array of user objects to display
 * @property {boolean} [loading=false] - Whether the table is in loading state
 * @property {(user: User) => void} [onEdit] - Callback when edit action is triggered
 * @property {(user: User) => void} [onDelete] - Callback when delete action is triggered
 */
export interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}
````

### **2. API Documentation**

#### **2.1 OpenAPI/Swagger Standards**

```java
@Tag(name = "User Management", description = "APIs for managing user accounts")
@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Operation(
        summary = "Get all users with pagination and filtering",
        description = "Retrieves a paginated list of users with optional filtering by role, status, and search term"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getUsers(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Number of items per page", example = "20")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Sort field and direction", example = "id,desc")
            @RequestParam(defaultValue = "id,desc") String[] sort,

            @Parameter(description = "Search term for filtering users")
            @RequestParam(required = false) String searchTerm,

            @Parameter(description = "Filter by user role")
            @RequestParam(required = false) UserRole role,

            @Parameter(description = "Filter by user status")
            @RequestParam(required = false) UserStatus status) {
        // Implementation
    }
}
```

---

## 🌿 Git Standards

### **1. Branch Naming**

#### **1.1 Branch Naming Convention**

```bash
# ✅ Correct: Feature branches
feature/user-management
feature/product-search
feature/admin-dashboard

# ✅ Correct: Bugfix branches
bugfix/memory-leak-in-brand-table
bugfix/login-validation-error
bugfix/api-response-format

# ✅ Correct: Hotfix branches
hotfix/security-vulnerability
hotfix/critical-bug-fix

# ✅ Correct: Release branches
release/v1.0.0
release/v1.1.0

# ❌ Wrong: Inconsistent naming
user_management
fix-bug
hotfix-urgent
new-feature
```

### **2. Commit Message Standards**

#### **2.1 Commit Message Format**

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### **2.2 Commit Types**

```bash
# ✅ Correct commit types
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting, missing semicolons, etc)
refactor: Code refactoring
test: Adding or updating tests
chore: Build process or auxiliary tool changes
perf: Performance improvements
security: Security fixes

# ✅ Correct commit examples
feat(auth): add user registration with email verification
fix(products): resolve memory leak in brand table image handling
docs(readme): update setup instructions for Windows users
refactor(api): extract common validation logic to shared service
test(users): add unit tests for user service methods
perf(dashboard): implement virtual scrolling for large datasets
security(auth): fix XSS vulnerability in user input handling
```

#### **2.3 Commit Message Examples**

```
feat(products): add product variant management

- Add ProductVariant entity with SKU, price, and stock fields
- Implement CRUD endpoints for product variants
- Add variant management UI in product form
- Update product detail API to include variants

Closes #123

---

fix(auth): resolve account lockout issue

- Fix account lockout timer not resetting after successful login
- Add proper validation for lockout duration
- Update login history tracking for lockout events

Fixes #45
```

---

## 🧪 Testing Standards

### **1. Backend Testing**

#### **1.1 Unit Test Structure**

```java
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("Should create user successfully when email is available")
    void shouldCreateUserSuccessfully_whenEmailIsAvailable() {
        // Given
        CreateUserRequestDTO request = CreateUserRequestDTO.builder()
            .email("test@example.com")
            .password("Password123")
            .fullName("Test User")
            .role(UserRole.USER)
            .status(UserStatus.ACTIVE)
            .build();

        User savedUser = User.builder()
            .id(1L)
            .email(request.getEmail())
            .fullName(request.getFullName())
            .role(request.getRole())
            .status(request.getStatus())
            .build();

        UserResponseDTO expectedResponse = UserResponseDTO.from(savedUser);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userMapper.toResponseDTO(savedUser)).thenReturn(expectedResponse);

        // When
        UserResponseDTO actualResponse = userService.createUser(request);

        // Then
        assertThat(actualResponse).isEqualTo(expectedResponse);
        verify(userRepository).existsByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
        verify(eventPublisher).publishEvent(any(UserCreatedEvent.class));
    }

    @Test
    @DisplayName("Should throw EmailAlreadyExistsException when email is already in use")
    void shouldThrowEmailAlreadyExistsException_whenEmailIsAlreadyInUse() {
        // Given
        CreateUserRequestDTO request = CreateUserRequestDTO.builder()
            .email("existing@example.com")
            .password("Password123")
            .fullName("Test User")
            .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> userService.createUser(request))
            .isInstanceOf(EmailAlreadyExistsException.class)
            .hasMessage("Email already exists: " + request.getEmail());

        verify(userRepository).existsByEmail(request.getEmail());
        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(eventPublisher);
    }
}
```

#### **1.2 Integration Test Structure**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Should create user and return 201 status")
    void shouldCreateUser_andReturn201Status() {
        // Given
        CreateUserRequestDTO request = CreateUserRequestDTO.builder()
            .email("newuser@example.com")
            .password("Password123")
            .fullName("New User")
            .role(UserRole.USER)
            .status(UserStatus.ACTIVE)
            .build();

        // When
        ResponseEntity<UserResponseDTO> response = restTemplate.postForEntity(
            "/api/admin/users", request, UserResponseDTO.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo(request.getEmail());
        assertThat(response.getBody().getFullName()).isEqualTo(request.getFullName());

        Optional<User> savedUser = userRepository.findByEmail(request.getEmail());
        assertThat(savedUser).isPresent();
        assertThat(savedUser.get().getEmail()).isEqualTo(request.getEmail());
    }
}
```

### **2. Frontend Testing**

#### **2.1 Component Test Structure**

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserTable } from "./user-table";
import { User } from "@/types/user.types";

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    email: "user1@example.com",
    fullName: "User One",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "user2@example.com",
    fullName: "User Two",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2025-01-02T00:00:00Z",
  },
];

describe("UserTable", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderComponent = (props: Partial<UserTableProps> = {}) => {
    const defaultProps: UserTableProps = {
      users: mockUsers,
      loading: false,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <UserTable {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  it("should render users list correctly", () => {
    renderComponent();

    expect(screen.getByText("User One")).toBeInTheDocument();
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("User Two")).toBeInTheDocument();
    expect(screen.getByText("user2@example.com")).toBeInTheDocument();
  });

  it("should show loading state when loading prop is true", () => {
    renderComponent({ loading: true });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("User One")).not.toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const onEdit = jest.fn();
    renderComponent({ onEdit });

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  it("should call onDelete when delete button is clicked", async () => {
    const onDelete = jest.fn();
    renderComponent({ onDelete });

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  it("should render empty state when no users", () => {
    renderComponent({ users: [] });

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });
});
```

#### **2.2 Hook Test Structure**

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUsers } from "./use-users";
import { userService } from "@/services/users.service";

// Mock the service
jest.mock("@/services/users.service");
const mockUserService = userService as jest.Mocked<typeof userService>;

describe("useUsers", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should fetch users successfully", async () => {
    const mockUsers = {
      content: [
        { id: 1, email: "user1@example.com", fullName: "User One" },
        { id: 2, email: "user2@example.com", fullName: "User Two" },
      ],
      totalPages: 1,
      totalElements: 2,
      size: 20,
      number: 0,
    };

    mockUserService.getUsers.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers({ page: 0, pageSize: 20 }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockUsers);
      expect(result.current.error).toBeNull();
    });

    expect(mockUserService.getUsers).toHaveBeenCalledWith({
      page: 0,
      pageSize: 20,
    });
  });

  it("should handle error when fetching users fails", async () => {
    const errorMessage = "Failed to fetch users";
    mockUserService.getUsers.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers({ page: 0, pageSize: 20 }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

---

## 🔒 Security Standards

### **1. Authentication & Authorization**

#### **1.1 JWT Implementation**

```java
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationInMs;

    @Value("${app.jwt.refresh-expiration}")
    private int jwtRefreshExpirationInMs;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof CustomUserDetails) {
            CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
            claims.put("userId", customUserDetails.getId());
            claims.put("role", customUserDetails.getRole());
            claims.put("permissions", customUserDetails.getPermissions());
        }

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationInMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }
}
```

#### **1.2 Password Security**

```java
@Component
public class PasswordPolicy {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final String PASSWORD_PATTERN =
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    public void validatePassword(String password) {
        if (password == null) {
            throw new ValidationException("Password cannot be null");
        }

        if (password.length() < MIN_LENGTH) {
            throw new ValidationException("Password must be at least " + MIN_LENGTH + " characters long");
        }

        if (password.length() > MAX_LENGTH) {
            throw new ValidationException("Password must not exceed " + MAX_LENGTH + " characters");
        }

        if (!password.matches(PASSWORD_PATTERN)) {
            throw new ValidationException(
                "Password must contain at least one uppercase letter, one lowercase letter, " +
                "one digit, and one special character"
            );
        }
    }

    public boolean isPasswordStrong(String password) {
        return password != null && password.matches(PASSWORD_PATTERN);
    }
}
```

### **2. Input Validation & Sanitization**

#### **2.1 Backend Validation**

```java
@RestController
@Validated
public class ProductController {

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody CreateProductRequestDTO request) {
        // Implementation
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam
            @Size(max = 100, message = "Search term must not exceed 100 characters")
            @Pattern(regexp = "^[a-zA-Z0-9\\s\\-]+$", message = "Invalid search term format")
            String searchTerm) {
        // Implementation
    }
}
```

#### **2.2 Frontend Validation**

```typescript
// ✅ Correct: Client-side validation with Zod
const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must not exceed 255 characters")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Invalid product name format"),

  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),

  basePrice: z
    .number()
    .min(0, "Price must be positive")
    .max(999999.99, "Price must not exceed 999,999.99"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must not exceed 255 characters")
    .regex(
      /^[a-z0-9\-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

// ✅ Correct: Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .replace(/javascript:/gi, "") // Remove javascript protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};
```

---

## 📚 Quick Reference Summary

### **Frontend Quick Reference**

```typescript
// Component Pattern
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return <div>...</div>;
}

// Hook Pattern
export function useCustomHook(options: Options = {}) {
  return useQuery({
    queryKey: ["key", options],
    queryFn: () => service.getData(options),
  });
}

// Form Pattern
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {},
});

// Service Pattern
export const serviceName = {
  method: async (params) => {
    const response = await apiClient.get("/endpoint", { params });
    return response.data;
  },
};
```

### **Backend Quick Reference**

```java
// Controller Pattern
@RestController
@RequestMapping("/api/resource")
public class ResourceController {
  @GetMapping
  public ResponseEntity<List<ResourceDTO>> getAll() {
    return ResponseEntity.ok(service.getAll());
  }
}

// Service Pattern
@Service
@Transactional
public class ServiceImpl implements Service {
  @Override
  public ResourceDTO create(CreateRequestDTO request) {
    return mapper.toDTO(repository.save(mapper.toEntity(request)));
  }
}

// Entity Pattern
@Entity
@Table(name = "table_name")
public class Entity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
}
```

---

**Last Updated:** November 29, 2025  
**Version:** 3.0.0  
**Repository:** https://github.com/HoangPhiTu/Orchard-store-java-private  
**Maintainers:** Orchard Store Development Team
