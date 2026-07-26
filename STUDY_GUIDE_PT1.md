# BLOOD-NET: COMPLETE STUDY GUIDE

> **Purpose**: Understand every line, decision, and technology in this Blood Donation Management System.
> **Target**: CS student with good HTML/CSS, beginner JS, near-zero React/Flask/SQLite/API knowledge.
> **How to Use**: Read sequentially. Open files referenced like `frontend/src/pages/Landing.jsx` and follow along.

---

# SECTION 1: PROJECT OVERVIEW

## 1.1 What This System Does

**Blood-Net** is a web platform connecting four groups:
1. **Donors** – people who donate blood
2. **Patients** – people who need blood
3. **Blood Banks** – facilities storing/distributing blood
4. **Admins** – system overseers

Features:
- Donors register, find nearby requests, donate
- Patients raise emergency blood requests
- Blood banks manage inventory, fulfill requests
- Admins approve/reject, oversee operations

## 1.2 Why It Was Built

Problems solved:
- **No centralized system** – scattered communication
- **Delayed response** – emergencies need speed
- **No inventory tracking** – banks don't know stock levels
- **No eligibility screening** – unsafe donations
- **No coordination** – duplicate or zero responses

## 1.3 Problems It Solves

| Problem | Solution |
|---------|----------|
| Donors don't know who needs blood | Open requests visible to all |
| Patients don't know stock levels | Inventory tracking + map |
| Blood banks can't manage paperwork | Digital inventory management |
| No eligibility tracking | Screening + 56-day cooldown |
| Fake requests | Patient verification |
| Unauthorized blood banks | Admin approval workflow |
| No communication | In-app notifications |

## 1.4 User Roles

**Donor**: Registers with phone, provides blood group/weight/health info. Views open requests, accepts them, toggles availability. 56-day cooldown. Must complete screening.

**Patient**: Registers with email, provides medical details, uploads doctor's note. Raises requests with urgency, sees accepted donors, marks fulfilled/cancelled.

**Blood Bank**: Registers with email, status starts "pending". After admin approval: manages inventory, fulfills requests, creates camps.

**Admin**: Pre-seeded accounts. Approves/rejects blood banks, verifies donations, completes requests, views all data.

## 1.5 Overall Architecture

```
FRONTEND (React + Vite + Tailwind)
  Pages -> Components -> Services -> Axios -> API
       |                                |
  Port 5173 ---- HTTP/JSON ----> Port 5000
                                     |
BACKEND (Flask)
  Routes -> Services -> Models -> SQLAlchemy -> DB
                                     |
                               SQLite (bloodnet.db)
```

**Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, Leaflet
**Backend**: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Cors
**Database**: SQLite (file-based, 10 tables)

---

# SECTION 2: COMPLETE PROJECT FLOW

## 2.1 Blood Request Journey

```
Landing Page
  -> Click "Register"
  -> Registration form (Donor/Patient/Blood Bank)
  -> JS validates form -> Axios POST /api/auth/register
  -> Flask validates -> hashes password -> saves to users table
  -> If donor: creates donor profile too
  -> If patient: redirects to patient registration
  -> If blood_bank: redirects to blood bank reg (status=pending)
  -> Login page
  -> Enter credentials -> POST /api/auth/login
  -> Flask checks password hash -> generates JWT tokens
  -> Frontend stores JWT in localStorage
  -> Redirect to Dashboard
  -> Patient clicks "Raise Blood Request"
  -> Modal opens -> fill details
  -> Axios POST /api/blood-request/create
  -> Flask creates blood_requests row (status=PENDING)
  -> Notification sent to matching donors
  -> Donor sees request -> clicks "Accept"
  -> Axios POST /api/donations/accept/:request_id
  -> Flask creates donation row (status=PENDING)
  -> Patient notified
  -> Patient clicks "Mark Fulfilled"
  -> Flask updates donation/request status
  -> If fully fulfilled: request = COMPLETED
```

## 2.2 Blood Bank Approval Flow

```
Blood Bank registers -> account created (role=blood_bank)
  -> Redirected to Blood Bank form (facility name, address, etc.)
  -> Flask saves with status = "pending"
  -> Blood Bank tries login -> REJECTED (pending)
  -> Admin logs in -> sees pending list
  -> Admin clicks "Approve"
  -> Flask updates status = "approved"
  -> Notification sent to blood bank
  -> Blood Bank can now login
  -> Dashboard: manage inventory, see requests, create camps
```

## 2.3 Donation Camp Flow

```
Blood Bank -> "Create Camp" -> fill name, date, time, location
  -> POST /api/camps/ -> camp saved
  -> Visible on: public camps page, map, donor dashboard
```

## 2.4 Inventory Flow

```
Blood Bank adds units -> POST /api/inventory/
  -> Flask creates/updates inventory row
  -> Inventory history entry (action=ADDED)
  -> Low stock -> status=LOW_STOCK, zero -> OUT_OF_STOCK
  -> Fulfill request -> units reduced, history entry (REDUCED)
```

---

# SECTION 3: FOLDER STRUCTURE

## 3.1 Root Level

```
Blood-Net/
  .gitignore              # Git ignore rules
  .venv/                  # Python virtual environment
  README.md
  dataset/                # eRaktKosh imported data (JSON)
  Backend/                # Flask API server
  frontend/               # React SPA
```

## 3.2 Backend Structure

```
Backend/
  run.py                  # ENTRY POINT: python run.py starts server
  requirements.txt        # pip install -r requirements.txt
  instance/bloodnet.db    # SQLite database (auto-created)
  uploads/licenses/       # Uploaded doctor notes (PDFs)
  app/
    __init__.py           # create_app() factory, blueprint registration, seed admin
    config.py             # SECRET_KEY, JWT, DB URI, upload paths
    extensions.py         # db=SQLAlchemy(), jwt=JWTManager()
    models/               # 10 table definitions
      user.py, donor.py, patient.py, blood_bank.py
      blood_request.py, donation.py, inventory.py
      inventory_history.py, notification.py, camp.py
      public_blood_bank.py
    routes/               # 12 API endpoint files
      auth.py, admin.py, donor.py, patient.py
      blood_bank.py, blood_request.py, donation.py
      inventory.py, notification.py, public_blood_bank.py
      map.py, camps.py
    services/             # Business logic (12 files)
      auth_service.py, admin_service.py, donor_service.py ...
    utils/                # Helpers
      decorator.py        # @role_required()
      password.py         # hash/verify password
      validators.py       # Email, phone, blood group validation
      helpers.py          # create_notification(), get_missing_fields()
      file_upload.py      # Save/delete files
      geocode.py          # Address -> coordinates
```

### Why Each File Exists

| File | Purpose |
|------|---------|
| `run.py` | Entry point - type `python run.py` to start server |
| `config.py` | Central configuration - easy to change settings |
| `extensions.py` | Creates DB/JWT objects early to avoid circular imports |
| `models/` | One file per database table |
| `routes/` | One file per URL group (like chapters in a book) |
| `services/` | Business logic separate from HTTP - testable, reusable |
| `utils/` | Small helpers used everywhere |

## 3.3 Frontend Structure

```
frontend/
  index.html              # THE ONE HTML file (SPA with <div id="root">)
  package.json            # npm dependencies
  vite.config.js          # Vite config (React + Tailwind)
  .env                    # VITE_API_BASE_URL=http://127.0.0.1:5000/api
  public/                 # Static files (favicon, icons)
  dist/                   # Built files (npm run build)
  src/
    main.jsx              # ENTRY POINT: renders <App /> into #root
    index.css             # Tailwind imports + custom theme
    App.jsx               # Root: AuthProvider + BrowserRouter + AppRoutes
    context/
      AuthContext.jsx       # Auth state provider (login/logout/token)
      authContextObject.js  # createContext()
      useAuth.js            # Custom hook for context
    routes/
      AppRoutes.jsx         # ALL routes defined
      ProtectedRoute.jsx    # Redirects if not logged in
      RoleBasedRoute.jsx    # Redirects if wrong role
    layouts/
      PublicLayout.jsx      # Public pages (navbar + content + footer)
      DashboardLayout.jsx   # Logged-in pages (sidebar + header + content)
      AuthLayout.jsx        # Login/register layout
    pages/                  # 36 page components
      Landing.jsx, Login.jsx, Register.jsx ...
    components/
      navigation/           # Navbar, Sidebar, Footer, Breadcrumb
      ui/                   # Button, Card, Badge, Input, Table ...
      forms/                # Input, Select, Checkbox, FileUpload ...
      feedback/             # Alert, Toast, LoadingSpinner, SkeletonLoader ...
      data/                 # Table, SearchBox, FilterPanel, Pagination
      auth/                 # LoginForm
      donor/                # ProfileCard, EditProfileModal, EligibilityClock ...
      patient/              # PatientEditProfileModal
      register/             # StepProgress, PatientRegister, DonorRegister ...
      shared/               # BloodMap, NotificationPanel, InventoryPanel ...
      dashboard/            # DashboardCard, StatisticsCard, StatusBadge
    services/
      api.js                # Axios instance with interceptors
      authService.js        # Auth API calls
      dashboardService.js   # All other API calls
    utils/
      constants.js          # Blood groups, urgency levels, status styles
      roleHelpers.js        # UI role <-> backend role mapping
      authStorage.js        # Token storage (localStorage + sessionStorage)
      donationCycles.js     # 56-day rule, donation intervals
```

---

# SECTION 4: FRONTEND (React + Tailwind)

## 4.1 What is React?

React is a JS library for building UIs using components.

**Old way**: manually update DOM with `document.getElementById()`
**React way**: declare what UI should look like; React handles DOM updates

Key idea: "When state changes, re-render the UI."

## 4.2 JSX (JavaScript XML)

JSX looks like HTML but is JavaScript:

```jsx
function Landing() {
  return (
    <div className="min-h-screen bg-cream-50">
      <HeroSection />
    </div>
  );
}
```

**Rules**: single parent element, `className` not `class`, `{}` for JS expressions, self-closing tags, `{/* comments */}`

## 4.3 Components

A component is a function returning JSX:

```jsx
function Button({ children, variant, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded ${variant}`}>
      {children}
    </button>
  );
}
```

**Why**: reusability, organization, testability, teamwork

## 4.4 Props

Props are inputs (read-only):

```jsx
// Definition
function Welcome({ name }) { return <h1>Hello {name}</h1>; }
// Usage
<Welcome name="Alice" />
```

Props flow DOWN, are read-only, like function parameters.

## 4.5 State

State is data that changes over time. When state changes, component re-renders:

```jsx
const [formData, setFormData] = useState({ email: '', password: '' });
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

### Props vs State

| Props | State |
|-------|-------|
| Passed from parent | Created inside component |
| Read-only | Can change via setter |
| Like parameters | Like local variables + re-render trigger |

## 4.6 React Hooks

### useState

**Purpose**: Store and update local state.

```jsx
const [count, setCount] = useState(0);
// setCount(count + 1) -> updates and re-renders
```

**Internal**: React remembers state across re-renders. Returns [currentValue, setter]. Calling setter schedules re-render.

**Mistakes**:
- Direct mutation: `count = 5` (NO re-render)
- Must use setter: `setCount(5)`
- Objects: `setUser({...user, name: 'new'})` (spread to new object)

### useEffect

**Purpose**: Side effects (API calls, timers, event listeners).

```jsx
useEffect(() => {
  fetchData();  // Runs once on mount
}, []);

useEffect(() => {
  document.title = `Count: ${count}`; // Runs when count changes
}, [count]);

useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer); // Cleanup on unmount
}, []);
```

**Three patterns**:
1. `[]` - runs once on mount
2. `[dep]` - runs when dep changes
3. no array - runs every render (avoid)

**Mistakes**: missing deps (stale data), no cleanup (memory leaks), infinite loops

### useRef

**Purpose**: Access DOM elements, store values without re-renders.

```jsx
const inputRef = useRef(null);
useEffect(() => { inputRef.current.focus(); }, []);
return <input ref={inputRef} />;
```

| useRef | useState |
|--------|----------|
| No re-render on change | Re-renders on change |
| Good for DOM, timers | Good for UI data |

### useContext

**Purpose**: Global state without prop drilling.

1. **Create**: `const AuthContext = createContext(null);`
2. **Provide**: `<AuthContext.Provider value={{user, login}}> {children} </AuthContext.Provider>`
3. **Consume**: `const { user } = useContext(AuthContext);`

Our project wraps entire app in AuthProvider so any component can access auth state.

### useNavigate

**Purpose**: Programmatic navigation:

```jsx
const navigate = useNavigate();
navigate('/dashboard');
navigate(-1); // go back
```

### useParams

**Purpose**: Get URL parameters:

```jsx
// Route: /donor/:id/profile -> URL: /donor/42/profile
const { id } = useParams(); // id = "42"
```

## 4.7 React Router

Maps URLs to components:

```jsx
<Routes>
  <Route path="/" element={<PublicLayout />}>
    <Route index element={<Landing />} />
    <Route path="about" element={<About />} />
  </Route>
  <Route path="/login" element={<Login />} />
  <Route path="/donor/dashboard" element={
    <ProtectedRoute><RoleBasedRoute allowedRoles={['donor']}>
      <DonorDashboard />
    </RoleBasedRoute></ProtectedRoute>
  } />
</Routes>
```

**Components**: `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, `<Navigate>`

## 4.8 Conditional Rendering

```jsx
// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}
// AND (short circuit)
{error && <ErrorMessage message={error} />}
// Multiple conditions
{status === 'loading' && <Spinner />}
{status === 'error' && <Error />}
{status === 'success' && <Data />}
```

## 4.9 Controlled Components

Input value controlled by React state:

```jsx
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />
```

**Why**: Single source of truth, easy validation, easy reset.

## 4.10 Tailwind CSS

Utility-first CSS. Instead of writing custom CSS, use classes directly:

```jsx
<button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
  Save
</button>
```

Responsive: `md:flex`, `lg:grid-cols-3`, `sm:text-sm`
Custom theme in index.css: `--color-cream-50: #FEFDFB;`

---

# SECTION 5: JAVASCRIPT (For This Project)

## 5.1 Variables

```js
let count = 0;    // Can reassign
const PI = 3.14;  // Cannot reassign (but object props can change)
// NEVER use var
```

## 5.2 Functions

```js
// Regular
function add(a, b) { return a + b; }
// Arrow (used everywhere in React)
const add = (a, b) => a + b;
```

## 5.3 Objects & Arrays

```js
const user = { name: "Alice", age: 25 };
user.name; // "Alice"
const items = [1, 2, 3];
items.push(4); // [1,2,3,4]
items[0]; // 1
```

## 5.4 Array Methods (Critical)

### map() - Transform each element

```js
const doubled = [1,2,3].map(n => n * 2); // [2,4,6]
// In React: convert array to JSX
{items.map(item => <Card key={item.id} data={item} />)}
```

### filter() - Keep matches

```js
const evens = [1,2,3,4].filter(n => n % 2 === 0); // [2,4]
const openRequests = requests.filter(r => r.status === 'PENDING');
```

### find() - First match

```js
const user = users.find(u => u.id === 5);
```

### reduce() - Combine to single value

```js
const sum = [1,2,3,4].reduce((total, n) => total + n, 0); // 10
const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
```

### some() / every()

```js
const hasAdults = users.some(u => u.age >= 18); // any?
const allAdults = users.every(u => u.age >= 18); // all?
```

## 5.5 Destructuring

```js
const user = { name: 'Alice', age: 25 };
const { name, age } = user; // name='Alice', age=25

const colors = ['red', 'green'];
const [first, second] = colors;

// In React (useState returns array)
const [count, setCount] = useState(0);

// In function parameters
function Button({ className, children }) { }
```

## 5.6 Spread Operator (...)

```js
const arr2 = [...arr1, 4, 5];               // Copy + add
const updated = { ...user, age: 26 };       // Copy + override
// In React (immutable state)
setFormData({ ...formData, email: 'new@e.com' });
```

## 5.7 Template Literals

```js
const msg = `Hello ${name}, you are ${age} years old`;
const cls = `px-4 py-2 ${isActive ? 'bg-red' : 'bg-gray'}`;
```

## 5.8 Modules

```js
// Export
export const BLOOD_GROUPS = ['A+', 'A-', ...];
export default Button;

// Import
import Button from '../components/ui/Button';
import { BLOOD_GROUPS } from '../utils/constants';
```

## 5.9 Promises

Object representing eventual completion:

```js
fetchUserData(id)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(err => console.error(err));
```

States: Pending -> Fulfilled | Rejected

## 5.10 Async/Await

```js
async function loadData() {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    return posts;
  } catch (err) {
    console.error(err);
  }
}
```

## 5.11 JSON

```json
{"name": "John", "age": 30, "isDonor": true}
```

```js
JSON.stringify(obj); // Object -> JSON string
JSON.parse(str);     // JSON string -> Object
```

## 5.12 Error Handling

```js
try {
  await riskyOperation();
} catch (error) {
  console.error(error.message);
} finally {
  cleanup();
}
```

## 5.13 Arrow Functions (Detail)

```js
// Full: const add = (a, b) => { return a + b; }
// Short: const add = (a, b) => a + b;
// One param: const double = n => n * 2;
// No params: const greet = () => 'Hello';
// Return object: const fn = () => ({ name: 'x' });
```

**Why in React**: No own `this`, short syntax, perfect for callbacks.

---

# SECTION 6: REACT DATA FLOW

## 6.1 Typing in a Textbox

```
User types "A"
  -> Browser fires onChange event
  -> React calls handler: setFormData({...formData, email: "A"})
  -> React saves "A" as state
  -> React re-renders component
  -> Input value is now "A"
  -> User sees "A" appear
```

React re-renders entire component on each keystroke (Virtual DOM makes it fast).

## 6.2 Clicking Submit

```
User clicks Submit
  -> onClick fires
  -> preventDefault() stops reload
  -> setLoading(true) -> shows spinner
  -> Validation runs
  -> If valid: axios.post('/endpoint', formData)
  -> HTTP request sent to Flask
```

## 6.3 State Update

```
setState(newValue)
  -> React schedules update (batches multiple)
  -> Calculates what changed (diffing)
  -> Updates only changed parts of real DOM
```

## 6.4 Component Re-renders When

1. State changes (setState called)
2. Props change (parent re-renders with new props)
3. Parent re-renders (children re-render by default)

## 6.5 Data Flow to Backend

```
React Component -> authService.loginUser(email, pass)
  -> api.post('/auth/login', {email, password})
  -> Axios adds base URL + auth headers
  -> HTTP Request (POST localhost:5000/api/auth/login)
  -> Flask Blueprint route (auth.py)
  -> Service (auth_service.py)
  -> Model (User.query...)
  -> SQLite Database
```

## 6.6 Backend Response

```
Database -> User found -> check password hash
  -> Generate JWT tokens
  -> jsonify({access_token, user})
  -> HTTP Response (200 OK, JSON body)
  -> Axios receives in frontend
```

## 6.7 UI Update

```
Axios response -> authService returns data
  -> setLoading(false), setUser(data.user)
  -> AuthContext re-renders (all consumers update)
  -> navigate('/donor/dashboard')
```

---

# SECTION 7: AXIOS

## 7.1 What is Axios?

HTTP client for making API requests from the browser.

## 7.2 Why Axios over Fetch

| Feature | fetch() | Axios |
|---------|---------|-------|
| JSON handling | Need .json() | Automatic |
| Error handling | Only network errors | All error statuses |
| Interceptors | No | Yes |
| Timeout | Manual | Built-in |

## 7.3 Axios Instance (api.js)

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});
```

All requests share base URL and default headers.

## 7.4 Interceptors

**Request** (before every request): auto-attach JWT token
**Response** (after every response): auto-refresh expired tokens, retry requests

```js
api.interceptors.request.use( config => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token and retry
    }
    return Promise.reject(error);
  }
);
```

## 7.5 HTTP Methods

| Method | Our Usage |
|--------|-----------|
| GET | Fetch data: `api.get('/blood-request/open')` |
| POST | Create: `api.post('/auth/login', data)` |
| PUT | Full update: `api.put('/donor/profile', data)` |
| PATCH | Partial update: `api.patch(\`/admin/blood-banks/${id}/approve\`)` |
| DELETE | Remove: `api.delete(\`/inventory/${id}\`)` |

## 7.6 Headers & Body

```js
// Headers (metadata)
{ 'Content-Type': 'application/json', 'Authorization': 'Bearer token' }
// Body (data for POST/PUT)
{ "email": "user@test.com", "password": "secret" }
```

## 7.7 Response Object

```js
{ data: {...}, status: 200, statusText: 'OK', headers: {...}, config: {...} }
```

## 7.8 Error Handling

```js
try { const res = await api.post('/login', data); }
catch (err) {
  if (err.response) { /* Server responded with error */ }
  else if (err.request) { /* No response */ }
  else { /* Other error */ }
}
```

---

# SECTION 8: BACKEND (Flask)

## 8.1 What is Flask?

Lightweight Python web framework for HTTP APIs.

## 8.2 Application Entry (run.py)

```python
from app import create_app
app = create_app()
app.run(debug=True, port=5000)
```

## 8.3 create_app() Factory

```python
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)      # Database
    jwt.init_app(app)     # JWT auth
    CORS(app)             # Cross-origin

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    # ... more blueprints

    with app.app_context():
        db.create_all()   # Create tables
        seed_admin_users() # Create default admins

    return app
```

## 8.4 Blueprints

Organize routes into groups:

```python
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # logic
    return jsonify({'token': token}), 200
```

## 8.5 Route Decorators

```python
@auth_bp.route('/login', methods=['POST'])
@jwt_required()
@role_required('admin')
def admin_only():
    user_id = get_jwt_identity()
    return jsonify({'message': 'Admin access granted'})
```

## 8.6 request Object

```python
data = request.get_json()          # JSON body
file = request.files['doc']        # Uploaded file
param = request.args.get('q')      # URL query param
headers = request.headers.get('Authorization')  # Headers
```

## 8.7 jsonify

```python
return jsonify({'message': 'Success', 'data': result}), 200
return jsonify({'error': 'Not found'}), 404
```

## 8.8 REST API Principles

- Resources are URLs (`/api/users`, `/api/blood-requests`)
- Methods = actions (GET=read, POST=create, PUT/PATCH=update, DELETE=delete)
- Stateless (each request has all needed info)
- JSON format

## 8.9 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK (success) |
| 201 | Created (new resource) |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Validation failed |
| 500 | Server Error |

## 8.10 JWT Auth

```python
# Login
access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
refresh_token = create_refresh_token(identity=str(user.id))

# Protect route
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

# Role check
@role_required('admin')
def admin_only():
```

## 8.11 @role_required Decorator

```python
def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt_identity()
            user = User.query.get(int(claims))
            if user.role not in roles:
                return jsonify({'error': 'Forbidden'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
```

## 8.12 CORS

```python
from flask_cors import CORS
CORS(app, origins=['http://localhost:5173'])
```

Needed because frontend (5173) and backend (5000) are different origins.

## 8.13 Service Layer

Routes are thin; services contain business logic:

```python
# Route (handles HTTP)
@auth_bp.route('/login', methods=['POST'])
def login():
    return auth_service.login(request.get_json())

# Service (business logic)
def login(data):
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'error': 'Credentials not matched'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': token, 'user': user.to_dict()}), 200
```

---

# SECTION 9: DATABASE (SQLite + SQLAlchemy)

## 9.1 What is a Database?

Structured data storage. Like Excel: Tables = sheets, Rows = records, Columns = fields.

## 9.2 SQLite

File-based database (bloodnet.db). Zero config, portable. Good for development.

## 9.3 SQLAlchemy (ORM)

Write Python classes instead of SQL:

```python
# Raw SQL: SELECT * FROM users WHERE email = 'x@y.com'
# ORM:
User.query.filter_by(email='x@y.com').first()
```

## 9.4 Our Tables

**users**: id, first_name, last_name, email, phone, password_hash, role, gender, dob, city, is_active
**donors**: id, user_id(FK), blood_group, weight, last_donation_date, is_eligible, health questions
**patients**: id, user_id(FK), blood_group_needed, hospital, condition, urgency, doctor_note
**blood_banks**: id, user_id(FK), facility_name, status(pending/approved/rejected), address, lat/lng
**blood_requests**: id, created_by(FK), blood_group, units, hospital, urgency, status
**donations**: id, blood_request_id(FK), donor_id(FK), status, donated_units
**inventory**: id, blood_bank_id(FK), blood_group, units, expiry, status
**inventory_history**: id, blood_bank_id(FK), blood_group, action(ADDED/REDUCED), units
**notifications**: id, user_id(FK), title, message, status(UNREAD/READ)
**camps**: id, blood_bank_id(FK), name, date, time, location

## 9.5 Primary & Foreign Keys

**Primary Key**: Unique row identifier (auto-incrementing id)
**Foreign Key**: Links to another table's primary key

```python
class BloodBank(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
```

## 9.6 CRUD Operations

```python
# CREATE
user = User(name='John', email='j@t.com')
db.session.add(user); db.session.commit()

# READ
User.query.all()                          # All
User.query.filter_by(email='x').first()   # By condition
User.query.get(5)                         # By ID

# UPDATE
user = User.query.get(5)
user.city = 'Mumbai'; db.session.commit()

# DELETE
db.session.delete(user); db.session.commit()
```

## 9.7 Relationships

**One-to-One**: User -> Donor (donor.user_id is UNIQUE)
**One-to-Many**: User -> Notifications (notification.user_id not unique)
**Many-to-Many**: Donors <-> Blood Requests via Donations table

## 9.8 Transactions

All-or-nothing operations:

```python
try:
    inventory.units -= 2
    request.status = 'COMPLETED'
    db.session.commit()
except:
    db.session.rollback()
```

---

# SECTION 10: LOGIN SYSTEM

## 10.1 Registration

```
User fills form -> frontend validation -> POST /api/auth/register
  -> Flask validates -> check email/phone uniqueness -> hash password
  -> Create user -> if donor: create donor profile -> return success
```

## 10.2 Password Hashing

```python
from werkzeug.security import generate_password_hash, check_password_hash

# Store: user.password_hash = generate_password_hash('secret')
# Verify: check_password_hash(user.password_hash, 'secret')
```

Hash is one-way (like baking a cake - can't reverse to ingredients).

## 10.3 Login Flow

```
POST /api/auth/login {email, password}
  -> Find user by email
  -> If blood bank: check status (pending/rejected blocks login)
  -> verify password hash
  -> Generate access_token (30min) + refresh_token (30 days)
  -> Return {access_token, refresh_token, user}
```

## 10.4 JWT Structure

`xxxxx.yyyyy.zzzzz` (header.payload.signature)

Contains: user ID, role, expiry time. Signed so server can verify authenticity.

## 10.5 Token in Requests

```js
// Axios interceptor auto-adds:
headers: { Authorization: 'Bearer eyJ...' }
```

## 10.6 Token Refresh

When access token expires (401):
1. Interceptor catches 401
2. Posts refresh token to `/api/auth/refresh`
3. Gets new access token
4. Retries original request
5. User never notices

## 10.7 Logout

Clear tokens from localStorage/sessionStorage, clear user state, redirect to login.

## 10.8 Auth vs Authorization

**Authentication** (Who?): `@jwt_required()` / `<ProtectedRoute>`
**Authorization** (Can?): `@role_required('admin')` / `<RoleBasedRoute>`

---

# SECTION 11: BLOOD BANK FLOW

## 11.1 Registration

User selects "Blood Bank" -> creates account (role=blood_bank)
-> Redirected to Blood Bank form: facility_name, address, contact_person, operating_hours
-> Address geocoded to lat/lng for map
-> Status = "pending"

## 11.2 Pending Status Effect

- Login is BLOCKED for pending accounts
- Error: "Account not yet approved. Contact admin."
- Prevents unauthorized blood banks from accessing system

## 11.3 Admin Approval

Admin sees pending list -> clicks Approve -> status = "approved", notification sent.

## 11.4 Rejection

Admin clicks Reject -> provides reason -> status = "rejected", reason stored.
Blood bank can never login.

## 11.5 After Approval

Once approved, blood bank can:
- Manage inventory (add/update/delete blood units)
- Fulfill requests from inventory
- Create donation camps
- View dashboard stats

## 11.6 Fulfilling Requests

Blood bank sees open requests matching their blood groups.
Clicks Fulfill -> reduces inventory units -> updates request status -> history logged.

---

# SECTION 12: PATIENT FLOW

## 12.1 Registration

User selects Patient -> fills basic info -> role=patient
-> Patient form: blood_group_needed, hospital, condition, urgency, relation_to_patient
-> Optional: upload doctor's note (PDF) for verification

## 12.2 Dashboard

Shows: active requests, accepted donors, recent activity, quick actions.

## 12.3 Raising Request

Clicks "Raise Blood Request" -> modal with form
-> Blood group, units, hospital, urgency, required before date
-> POST /api/blood-request/create -> status=PENDING
-> Matching donors notified

## 12.4 Tracking Status

Statuses: PENDING -> MATCHED -> ACCEPTED -> COMPLETED -> CANCELLED

## 12.5 Marking Fulfilled

When donor donates -> patient marks fulfilled/not fulfilled
-> Donation status updated -> inventory updated

## 12.6 Emergency Requests

CRITICAL urgency -> highlighted on donor dashboards -> immediate notification

---

# SECTION 13: DONOR FLOW

## 13.1 Registration

Select Donor -> phone, password, gender, dob, city
-> Donor profile: blood_group, weight, health screening questions
-> is_eligble determined by health answers

## 13.2 Dashboard

Shows: eligibility status, open requests, donation history, upcoming camps, next eligible date.

## 13.3 Eligibility Screening

Checks: 56-day rule, chronic conditions, weight >= 50kg, health answers.
If any fail -> not eligible until resolved.

## 13.4 Accepting Request

Browse open requests matching blood group -> click Accept
-> Donation created (status=PENDING) -> Patient notified

## 13.5 56-Day Rule

After donating, must wait 56 days before next donation.
Calculated: `(today - last_donation_date).days >= 56`

## 13.6 Donation History

View: date, request details, status (verified/rejected), total count.

---

# SECTION 14: ADMIN FLOW

## 14.1 Admin Creation

Seeded on server start: `iamadmin@gmail.com/password` and `vinay@gmail.com/password2`.

## 14.2 Dashboard

System-wide stats: total users, donors, patients, blood banks, requests.
Pending approvals, recent activity, quick actions.

## 14.3 Approve/Reject Blood Banks

Approve -> status=approved, notification sent
Reject -> status=rejected, reason stored, notification sent

## 14.4 Verify Donations

View all donations -> verify (updates inventory) or reject.

## 14.5 Manage Requests

View all requests -> mark complete -> view details.

---

# SECTION 15: API FLOW

## 15.1 Request Flow Diagram

```
Browser/React                    Flask Server                  SQLite
    |                                |                          |
    | 1. User clicks button          |                          |
    | 2. Event handler runs          |                          |
    | 3. setLoading(true)            |                          |
    | 4. Axios POST /endpoint        |                          |
    |    + JSON body + Bearer token  |                          |
    |------------------------------->|                          |
    |                                | 5. @jwt_required()       |
    |                                | 6. @role_required()      |
    |                                | 7. Route logic           |
    |                                | 8. Service logic         |
    |                                | 9. Query DB              |
    |                                |------------------------->|
    |                                | 10. Results              |
    |                                |<-------------------------|
    |                                | 11. Process results      |
    |                                | 12. jsonify(response)    |
    | 13. JSON response              |                          |
    |<-------------------------------|                          |
    | 14. setState(newData)          |                          |
    | 15. React re-renders           |                          |
    | 16. UI updates                 |                          |
```

## 15.2 Login Flow

```
Frontend POST /api/auth/login {email, password}
  -> Flask finds user by email
  -> Queries SQLite: SELECT * FROM users WHERE email = ?
  -> check_password_hash()
  -> create_access_token() + create_refresh_token()
  -> Response: {access_token, refresh_token, user}
  -> Frontend stores tokens in localStorage
  -> Redirects to dashboard
```

## 15.3 Blood Request Flow

```
Patient submits form -> POST /blood-request/create
  -> Flask validates -> inserts into blood_requests (status=PENDING)
  -> Creates notifications for matching donors
  -> Response: {request_id, status, created_at}
  -> Frontend shows success message
```

## 15.4 Donor Accepts

```
Donor clicks Accept -> POST /api/donations/accept/42
  -> Check eligibility (56 days, health)
  -> Check request still PENDING
  -> Create donation (status=PENDING)
  -> Notify patient
```

---

# SECTION 16: ANIMATIONS

## 16.1 Framer Motion

React animation library. Uses `motion.` components:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

**Variants** (reusable presets):

```jsx
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};
<motion.div variants={variants} initial="hidden" animate="visible" />
```

**Staggered children** (animate one by one): `staggerChildren: 0.1`
**AnimatePresence**: animate elements leaving screen (modals)

## 16.2 CSS Animations

```css
.button { transition: all 0.3s ease; }
.button:hover { transform: scale(1.05); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.5s ease forwards; }
```

## 16.3 Intersection Observer

Detects when element enters viewport (scroll animations):

```jsx
const [isVisible, setIsVisible] = useState(false);
const ref = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
    { threshold: 0.1 }
  );
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);

return <div ref={ref} className={`${isVisible ? 'opacity-100' : 'opacity-0'}`}>
  {children}
</div>;
```

---

# SECTION 17: PROJECT BUILD ORDER

## Phase 1: Foundation (Days 1-2)
1. Database Schema (all tables, relationships, models)
2. Flask Setup (app factory, extensions, CORS, DB connection)
3. Basic Auth (registration, login, JWT, password hashing)

## Phase 2: Backend API (Days 3-5)
4. User Routes + Services (profile CRUD, role-specific)
5. Blood Request System (create, list, update, cancel)
6. Donation System (accept, track, verify)
7. Inventory System (CRUD, stock levels)
8. Admin Endpoints (approve, verify, stats)
9. Notifications (create, read)
10. Additional (camps, map, public banks)

## Phase 3: Frontend (Days 6-10)
11. React setup (Vite, Tailwind, folder structure)
12. Auth frontend (login, register, context, protected routes)
13. Layouts (PublicLayout, DashboardLayout, Navbar, Sidebar)
14. UI components (Button, Card, Input, Table, Modal, etc.)
15. Public pages (Landing, About, Camps, Map)
16. Dashboards (donor, patient, blood bank, admin)
17. Feature pages (requests, inventory, donations, profile)
18. Integration (connect forms to APIs, error/loading states)

## Phase 4: Polish (Days 11-12)
19. Animations (transitions, loading, modals)
20. Responsive design (mobile, tablet, desktop)
21. Testing (manual flows, edge cases, errors)

## Phase 5: Deployment (Days 13-14)
22. Build frontend (npm run build)
23. Production server config
24. Database setup
25. Deploy + test

---

# SECTION 18: INTERVIEW QUESTIONS

## General Project

1. **Q: What is Blood-Net?**
   A: Web-based blood donation system connecting donors, patients, blood banks, and admins.

2. **Q: Why built?**
   A: No centralized system, delayed emergency response, lack of inventory tracking, no eligibility screening.

3. **Q: Tech stack?**
   A: React + Vite + Tailwind (frontend), Flask + SQLAlchemy + SQLite (backend), Axios (HTTP), JWT (auth).

4. **Q: Why React?**
   A: Component reusability, efficient Virtual DOM, huge ecosystem, declarative UI.

5. **Q: Why Flask over Django?**
   A: Lightweight, flexible, only what we need. Simpler for focused APIs.

6. **Q: Why SQLite?**
   A: Zero config, file-based, ideal for dev/demo. Would use PostgreSQL in production.

7. **Q: User roles?**
   A: Donor (gives blood), Patient (needs blood), Blood Bank (stores/distributes), Admin (oversees).

8. **Q: Architecture?**
   A: Client-server. React SPA communicates via REST API with Flask backend connected to SQLite.

## React

9. **Q: What is React?**
   A: JS library for building UIs with reusable components. Updates UI efficiently when data changes.

10. **Q: What is JSX?**
    A: JavaScript XML. HTML-like syntax compiled to JS function calls.

11. **Q: What are props?**
    A: Read-only inputs passed from parent to child. Like function parameters.

12. **Q: What is state?**
    A: Internal component data that triggers re-render when changed.

13. **Q: Props vs State?**
    A: Props = passed in (read-only). State = internal (mutable via setter). Props change externally, state changes internally.

14. **Q: What are hooks?**
    A: Functions that let function components use React features (state, lifecycle, etc.).

15. **Q: What is useState?**
    A: Hook for local state. Returns [value, setter]. Setter triggers re-render.

16. **Q: What is useEffect?**
    A: Hook for side effects (API calls, timers). Runs after render. Dependency array controls when.

17. **Q: What is useContext?**
    A: Hook for consuming React Context. Shares state without prop drilling.

18. **Q: What is useRef?**
    A: Hook for mutable values that persist without re-renders. DOM access, timers.

19. **Q: What is useNavigate?**
    A: Hook for programmatic navigation. `navigate('/dashboard')`.

20. **Q: What is useParams?**
    A: Hook to get URL parameters from current route.

21. **Q: useEffect dependency array?**
    A: Controls when effect re-runs. `[]` = once, `[dep]` = when dep changes, no array = every render.

22. **Q: Controlled component?**
    A: Input value controlled by React state via value + onChange.

23. **Q: Conditional rendering?**
    A: Using ternary, &&, or if-else to show different UI.

24. **Q: Keys in lists?**
    A: Unique identifiers for React to track list items efficiently.

25. **Q: ProtectedRoute?**
    A: Wrapper checking auth. Redirects to login if not authenticated.

26. **Q: RoleBasedRoute?**
    A: Wrapper checking user role. Redirects if wrong role.

27. **Q: Virtual DOM?**
    A: React's lightweight JS DOM representation. Changes are diffed, only real DOM updates applied.

## JavaScript

28. **Q: let vs const vs var?**
    A: let (block-scoped, reassignable), const (block-scoped, not reassignable), var (function-scoped, avoid).

29. **Q: Arrow functions?**
    A: Shorter syntax, no own `this`, no `arguments`. `const fn = () => {}`.

30. **Q: Destructuring?**
    A: Extract values: `const { name } = obj; const [first] = arr;`

31. **Q: Spread operator?**
    A: `...` expands iterables. Copy arrays/objects immutably.

32. **Q: Template literals?** `` `Hello ${name}` ``
    A: Strings with embedded expressions using backticks.

33. **Q: map()?**
    A: Array method, transforms each element, returns new array. Used to render lists in React.

34. **Q: filter()?**
    A: Array method, returns elements passing a test.

35. **Q: find()?**
    A: Array method, returns first element passing a test.

36. **Q: reduce()?**
    A: Array method, reduces to single value.

37. **Q: Promise?**
    A: Object for async operations. States: pending, fulfilled, rejected.

38. **Q: async/await?**
    A: Syntactic sugar for promises. `async` function + `await` keyword.

39. **Q: JSON?**
    A: JavaScript Object Notation. Data format for API communication.

40. **Q: Truthy/falsy?**
    A: Falsy: false, 0, "", null, undefined, NaN. Everything else truthy.

## Axios

41. **Q: What is Axios?**
    A: HTTP client for browser/Node. Promises, interceptors, auto JSON.

42. **Q: Axios vs Fetch?**
    A: Auto JSON parsing, interceptors, better error handling, timeout.

43. **Q: Axios interceptors?**
    A: Functions that run on every request/response. Used for auth headers, token refresh.

44. **Q: HTTP methods used?**
    A: GET (read), POST (create), PUT (full update), PATCH (partial), DELETE (remove).

45. **Q: Request interceptor?**
    A: Runs before request sent. Attaches auth token.

46. **Q: Response interceptor?**
    A: Runs after response received. Handles 401 token refresh.

47. **Q: Error handling?**
    A: try/catch. error.response (server), error.request (network), error.message (other).

## Flask/Backend

48. **Q: What is Flask?**
    A: Lightweight Python web framework for APIs.

49. **Q: What are Blueprints?**
    A: Route organization into modules with URL prefixes.

50. **Q: What is jsonify?**
    A: Converts Python dict to JSON response.

51. **Q: What is @jwt_required()?**
    A: Decorator ensuring valid JWT token before route executes.

52. **Q: What is create_access_token()?**
    A: Creates short-lived JWT (30 min) on successful login.

53. **Q: What is get_jwt_identity()?**
    A: Gets user ID from the JWT token.

54. **Q: What is @role_required()?**
    A: Custom decorator checking user role against allowed roles.

55. **Q: What is CORS?**
    A: Cross-Origin Resource Sharing. Allows frontend (5173) to call backend (5000).

56. **Q: REST API principles?**
    A: Resources as URLs, HTTP methods as actions, stateless, JSON.

57. **Q: Service layer pattern?**
    A: Separating business logic from HTTP handling. Thinner routes, testable services.

58. **Q: App factory pattern?**
    A: `create_app()` function creating Flask app. Multiple instances for testing.

## Database

59. **Q: What is SQLite?**
    A: File-based database. Zero config, stored in single .db file.

60. **Q: What is SQLAlchemy?**
    A: ORM - write Python classes instead of SQL. Handles connections, prevents SQL injection.

61. **Q: Primary key?**
    A: Unique row identifier (auto-incrementing id).

62. **Q: Foreign key?**
    A: Links to another table's primary key. Creates relationships.

63. **Q: db.session.commit()?**
    A: Saves pending changes to database.

64. **Q: db.session.rollback()?**
    A: Undoes pending changes since last commit.

65. **Q: One-to-One vs One-to-Many?**
    A: 1:1 - foreign key is UNIQUE. 1:N - foreign key is not unique.

## Auth

66. **Q: How does login work?**
    A: POST credentials -> verify password hash -> create JWT tokens -> store in localStorage.

67. **Q: Why hash passwords?**
    A: If database is stolen, hashes can't be reversed to original passwords.

68. **Q: How token refresh works?**
    A: 401 response -> interceptor calls refresh endpoint -> gets new token -> retries request.

69. **Q: Auth vs Authorization?**
    A: Auth = "who are you?" (login). Authorization = "what can you do?" (role check).

70. **Q: Why JWT?**
    A: Stateless, self-contained, verifiable, scalable across servers.

71. **Q: What's in a JWT?**
    A: Header, payload (user ID, role, expiry), signature.

72. **Q: How is JWT sent?**
    A: Authorization header: `Bearer <token>`.

## Project-Specific

73. **Q: How does blood bank approval work?**
    A: Registration creates pending status. Admin approves. Login blocked until approved.

74. **Q: How are notifications sent?**
    A: Stored in database. Frontend polls every 15 seconds.

75. **Q: How is inventory tracked?**
    A: Per blood_bank_id + blood_group. Units tracked, history logged, status based on stock level.

76. **Q: How does eligibility screening work?**
    A: Checks 56-day rule, weight >= 50kg, no chronic conditions, health questionnaire.

77. **Q: 56-day rule?**
    A: Donors must wait 56 days between donations for health recovery.

78. **Q: How does multi-tab auth work?**
    A: Tokens in both localStorage and sessionStorage. In-memory variable checked first.

79. **Q: How is data validated?**
    A: Frontend (form validation) + Backend (validators.py, model constraints).

80. **Q: How are files uploaded?**
    A: FormData with multipart/form-data. Stored in uploads/licenses/ as UUID filenames.

## Architecture Decisions

81. **Q: Why service layer?** - Separation of concerns, testability, reusability.

82. **Q: Why component library pattern?** - Consistency, reusability, custom styling.

83. **Q: Why not TypeScript?** - Simpler for learning, plain JS works for this scale.

84. **Q: Why Axios instance?** - Shared configuration (base URL, headers, interceptors).

85. **Q: Why context for auth?** - Auth state needed by all components, avoids prop drilling.

86. **Q: Why Vite?** - Fast dev server, instant HMR, modern build tool.

87. **Q: Why Tailwind v4?** - Latest version, utility-first, custom theme support.

88. **Q: Why Leaflet?** - Free, open-source map library. No API key needed.

89. **Q: Why Framer Motion?** - Declarative animations, easy to use with React.

90. **Q: Why Flask-Migrate?** - Database schema versioning (installed but not heavily used).

## Troubleshooting

91. **Q: What if token expires?** - Interceptor auto-refreshes using refresh token.

92. **Q: What if server is down?** - Axios timeout + error handling shows "Server unreachable".

93. **Q: What if wrong credentials?** - Vague error "Credentials not matched" (security, no account enumeration).

94. **Q: What if blood bank rejected?** - Cannot login ever. Contact admin.

95. **Q: What if request is fulfilled?** - Status changes to COMPLETED. Removed from open requests.

96. **Q: What if donor is ineligible?** - Cannot accept requests until eligible.

97. **Q: What if duplicate email?** - Unique constraint. Backend returns 409 Conflict.

98. **Q: What if file too large?** - File size limit in config, validation in file_upload.py.

99. **Q: What if cross-tab logout?** - storage event listener detects logout in other tab.

100. **Q: What if empty database?** - Seed data creates admin accounts on first run.

---

# SECTION 19: STUDY PLAN (1 Week)

## Day 1: Foundation (4-5 hours)

**Morning (2 hours)**: Read Sections 1-3
- Understand what the project does
- Understand the flow
- Understand folder structure
- Open files and match them to the structure

**Afternoon (2-3 hours)**: JavaScript Crash (Section 5)
- Variables, functions, arrow functions
- map(), filter(), find(), reduce() - PRACTICE
- Destructuring, spread, template literals
- Promises and async/await
- Run: `node -e "console.log([1,2,3].map(x=>x*2))"`

## Day 2: React Core (5-6 hours)

**Morning (3 hours)**: Sections 4.1 - 4.6
- What is React, JSX, Components
- Props vs State
- useState - practice with counter example
- useEffect - understand mounting and dependency array
- Build a tiny mini-app: button that increments count

**Afternoon (2-3 hours)**: Sections 4.7 - 4.13
- useContext (see how AuthContext works)
- useRef, useNavigate, useParams
- React Router (open AppRoutes.jsx, trace routes)
- Conditional rendering, controlled components

## Day 3: Axios + Data Flow (4-5 hours)

**Morning (2 hours)**: Sections 6-7
- Trace the complete login flow
- Open api.js, authService.js, AuthContext.jsx
- Understand interceptors
- Understand token refresh

**Afternoon (2-3 hours)**:
- Open a page component (Login.jsx or Register.jsx)
- Read it line by line
- Identify: useState, useEffect, handlers, axios calls
- Trace the data flow from button click to server

## Day 4: Flask Backend (5-6 hours)

**Morning (3 hours)**: Section 8
- What is Flask, routes, Blueprints
- Open run.py, __init__.py, config.py
- Open auth.py route, trace login endpoint
- Open auth_service.py, trace login function
- Understand @jwt_required(), @role_required()

**Afternoon (2-3 hours)**: Section 9
- Open user.py model
- Understand each column
- Open blood_request.py model
- Understand relationships
- Practice: SELECT, INSERT, UPDATE concepts

## Day 5: Full System Flow (5-6 hours)

**Morning (3 hours)**: Sections 10-15
- Login system (complete trace)
- Blood bank flow (register -> pending -> approve -> login)
- Patient flow (register -> raise request -> track)
- Donor flow (register -> accept -> donate)
- Admin flow (approve, verify, manage)

**Afternoon (2-3 hours)**: 
- Draw the architecture on paper
- Trace one complete flow from frontend to database and back
- Explain it out loud (pretend you're presenting)

## Day 6: Interview Prep (5-6 hours)

**Morning (3 hours)**: Section 18
- Read all 100 interview questions
- Answer each one out loud
- Mark questions you struggle with

**Afternoon (2-3 hours)**:
- Re-study marked questions
- Practice explaining:
  - "What happens when donor clicks Accept?"
  - "How does login work?"
  - "What is the difference between props and state?"
  - "How does data flow from frontend to backend?"

## Day 7: Final Review + Presentation (4-5 hours)

**Morning (2 hours)**: Quick review
- Skim all sections
- Re-read architecture, data flow
- Look at any real files you're unsure about

**Afternoon (2-3 hours)**: Mock presentation
- Explain the project to a friend/mirror
- Cover: problem, solution, architecture, each role, tech stack
- Be ready to answer: "Why this technology?"

---

# SECTION 20: CODE EXPLANATION PROTOCOL

When you paste a file, I will explain:

1. **Every line** - what it does
2. **Every function** - what it takes, returns, does
3. **Every variable** - why it exists, what it holds
4. **Why it exists** - the purpose
5. **How it connects** - to other files and components
6. **What would break** - if removed
7. **Beginner explanation** - simple analogy
8. **Intermediate explanation** - how it actually works
9. **Interview explanation** - how to explain in an interview

**Start pasting your files now. Open any file from the project and paste its contents. I will explain it completely.**
