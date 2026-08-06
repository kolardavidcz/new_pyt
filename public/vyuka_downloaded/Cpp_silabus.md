# C++ Competency Profile & Syllabus

This document outlines the scope of C++ knowledge and programming concepts acquired during the course, structured as a reference profile for other LLMs (e.g., to map equivalent skills in Python).

---

## 🛠️ Core Language & Non-Object Extensions
- **Namespaces**: Creating, nesting, and utilizing namespaces (`namespace`, `using namespace`).
- **Dynamic Allocation**: Manual memory management using `new`, `new[]`, `delete`, and `delete[]`.
- **References**: Reference variables (`Type&`), references to constants (`const Type&`), and contrast with pointer variables.
- **Function Overloading & Arguments**: Function overloading mechanisms, default argument values.
- **Input/Output (I/O) Streams**: Stream objects (`std::cin`, `std::cout`), stream manipulators (`std::setw`, `std::setprecision`, etc.), error state flags, and handling malformed input.

## 🧩 Object-Oriented Programming (OOP) in C++
- **Class Design & Encapsulation**: Structs vs. Classes, access modifiers (`private`, `protected`, `public`), member variables, and methods.
- **Constructors & Destructors**: Default constructor, parameterized constructors, member initializer lists, delegating constructors, and destructors (`~ClassName()`).
- **Constant Correctness**: Constant methods (`const` suffix on member functions) and constant objects.
- **Static Members**: Class-scoped static member variables and static methods.
- **Method Chaining**: Returning references (`*this`) to enable fluid/chained API patterns.

## ⚙️ Operator Overloading
- **Mechanics**: Member operators vs. non-member operators, using `friend` functions for asymmetric operators (e.g., stream insertion).
- **Comparison & Ordering**: Overloading relational operators (`==`, `!=`, `<`, etc.), defining strict weak ordering required by sorted STL containers (`std::set`, `std::map`).
- **Arithmetic & Logic**: Overloading mathematical, increment/decrement (`++`, `--`), and boolean/logical operators.
- **I/O Integration**: Custom stream insertion (`operator<<`) and extraction (`operator>>`) overloading.
- **Data Access**: Overloading indexing (`operator[]`), functor invocation (`operator()`), and member selection (`operator->`).

## 📦 Memory Management: Copy & Move Semantics
- **Rule of Three**:
  - Custom Copy Constructor.
  - Custom Copy Assignment Operator (`operator=`).
  - Custom Destructor.
- **Copy Idioms & Patterns**: Deep copy vs. shallow copy, explicit copy deletion (`= delete`), Copy-and-Swap idiom, reference counting, and Copy-on-Write (COW).
- **Rule of Five**:
  - Rvalue references (`Type&&`).
  - Move Constructor.
  - Move Assignment Operator.
  - Move-and-Swap idiom, `noexcept` specifier for guarantees.
  - Unifying assignment operator.

## 🧱 Standard Template Library (STL)
- **Sequence Containers**: Dynamic arrays (`std::vector`), double-ended queues (`std::deque`), doubly linked lists (`std::list`), and singly linked lists (`std::forward_list`).
- **Associative Containers**: Sorted sets (`std::set`, `std::multiset`) and sorted maps (`std::map`, `std::multimap`).
- **Unordered Containers (Hash Tables)**: `std::unordered_set`, `std::unordered_map`.
- **Container Adapters**: `std::stack`, `std::queue`, `std::priority_queue`.
- **Iterators**: Iterator types, forward and backward traversal, iterator invalidation, and range-based operations.
- **Specialized Types**: Bitwise arrays (`std::bitset`).

## 🔱 Polymorphism & Inheritance
- **Inheritance**: Base class extension, access inheritance specifiers (`public`, `protected`, `private` inheritance).
- **Dynamic Binding**: Virtual methods (`virtual`), pure virtual methods (`= 0`), virtual destructors (critical for preventing polymorphic memory leaks), and the Virtual Method Table (`vtable`).
- **Polymorphic Management**: Abstract classes, Runtime Type Information (RTTI), dynamic casting (`dynamic_cast`), and safe pointer management.
- **Smart Pointers**: RAII resource management using `std::unique_ptr` and `std::shared_ptr`.
- **Heterogeneous Collections**: Storing polymorphic types dynamically in STL containers.

## 🧬 Templates (Generics)
- **Generic Programming**: Declaring and utilizing function templates and class templates.
- **Compilation Model**: Header-only implementation of templates, template specialization.
- **Functional Passing**: Passing behaviors via function pointers, functors (classes with `operator()`), and inline lambda expressions.

## 💾 Exception Handling
- **Exceptions Control Flow**: `try`, `catch`, `throw` blocks, stack unwinding.
- **Exception Classes**: STL exception hierarchy (`std::exception`, `std::runtime_error`, etc.) and custom exception types.

## 🧭 Data Structures & Algorithms
- **Graph Processing**: Representing directed/undirected graphs, executing Breadth-First Search (BFS) and Depth-First Search (DFS) traversals. Dijkstra and Topological sort.