# Java Competency Profile & Syllabus

This document outlines the scope of Java knowledge and programming concepts acquired during the course, structured as a reference profile for other LLMs (e.g., to map equivalent skills in Python).

---

## 🛠️ Core Language & Syntax
- **Basic Syntax & Structure**: Main method (`public static void main(String[] args)`), entry points, compilation workflow.
- **Naming Conventions & Documentation**: CamelCase conventions, class/interface naming, Javadoc annotations (`@param`, `@return`, `@exception`, `@see`).
- **Data Types & Variables**: Primitives, variable scope (local vs instance vs class variables), default values, constants (`final`), and L-values/R-values.
- **Control Flow**:
  - Enhanced for-each loops.
  - Modern `switch` expressions (with `yield` statements, multiple labels, arrow syntax).
  - Loop labels (e.g., `outerLoop:` for multi-level break/continue).

## 🧩 Object-Oriented Programming (OOP)
- **Class Design & Encapsulation**: Classes, instantiation, constructors, access modifiers (`private`, `protected`, package-private, `public`), getters & setters.
- **Inheritance & Interfaces**:
  - Class inheritance (`extends`) and "Is-a" relationships.
  - Interfaces (`interface`, `implements`) and "Can-do" / "Has-a" capabilities.
- **Polymorphism**: Dynamic binding, method overriding (`@Override`) vs. overloading.
- **Inner Classes**: Non-static inner classes vs. static nested classes.
- **Abstract Classes**: Declaring abstract classes and templates (`abstract` keyword).

## 📦 Memory Management & Modifiers
- **Allocation & Garbage Collection**: Dynamic alocation using `new`, Java's automatic Garbage Collector (GC).
- **Access & Behavior Modifiers**:
  - `static`: Static fields, methods, initialization blocks.
  - `final`: Non-inheritable classes, non-overridable methods, constants.
  - `native`: Integration with native code via JNI.
  - `transient`: Field exclusion during serialization.
  - Type checking and safe casting (`instanceof` operator).

## 🧱 Standard Library, Generics & Iteration
- **Universal Object Methods**: Implementing/overriding `equals()`, `hashCode()`, and `deepHashCode()`.
- **Generics (Parametric Polymorphism)**:
  - Generics implementation for collections and custom types.
  - Wildcards, covariance (`? extends T`), and contravariance (`? super T`).
- **Iteration Patterns**:
  - Custom iterators implementing `Iterator` and `ListIterator`.
  - Parallel processing iterators (`Spliterator` with `trySplit` and `tryAdvance`).

## 🗃️ Collections Framework
- **Data Structures**:
  - `List`: Dynamic arrays (`ArrayList`), sorting and manipulation.
  - `Set`: Unique value collections.
  - `Map`: Key-value dictionaries, compute methods (`compute`, `computeIfAbsent`, `getOrDefault`).
- **Functional Programming**: Lambda expressions (`parameter -> expression`), functional interfaces.
- **Text Processing**: Regular expressions using `Pattern` and `Matcher` classes.

## 💾 Exception & Error Handling
- **Control Flow of Exceptions**: `try-catch-finally` blocks.
- **Hierarchy of Errors**: Checked vs. unchecked (`RuntimeException`) exceptions, system `Error`s.
- **Declaration & Throwing**: Method exception propagation (`throws` declaration) and explicit throwing (`throw new Exception`).
- **Resource Management**: Modern `try-with-resources` (Automatic Resource Management for closable streams/connections).

## 🔌 Input / Output (I/O & NIO)
- **Traditional I/O Streams**:
  - Byte-oriented streams (`FileInputStream`, `FileOutputStream`).
  - Character-oriented streams (`FileReader`, `FileWriter`, `BufferedReader` for line-by-line reading).
  - Stream buffering (`BufferedInputStream`).
- **Modern NIO & NIO.2**:
  - Path and file abstractions (`Path`, `Files`).
  - In-memory buffers and channel-based non-blocking I/O.
- **Character Encoding**: Handling differences in file encodings (UTF-8 vs UTF-16).

## 🌊 Streams API
- **Stream Pipelines**: Creating streams from collections, arrays, or recursive generators.
- **Intermediate Operations**: Lazy operations (`filter`, `map`, `range`, `limit`).
- **Terminal Operations**: Consuming streams (`collect`, `forEach`, reduction).

## 🧵 Concurrency & Multithreading
- **Threads Lifecycle**: Launching threads (`Thread`, `Runnable`), scheduler priorities, daemon threads (`setDaemon(true)`).
- **Virtual Threads**: Lightweight JVM-managed threads.
- **Thread Synchronization**:
  - Managing shared resources, critical sections.
  - Monitors and Intrinsic locks (`synchronized` blocks/methods).
  - Memory visibility and thread-safe reading (`volatile` keyword).
- **Execution coordination**: Thread joining (`join()`).

## 🌐 Networking
- **Protocols**: Concepts of TCP ("reliable connection") and UDP ("datagrams"), DNS, ports.
- **Socket Programming**: Client-server models using `Socket` and `ServerSocket`.
- **UDP Datagrams**: Sending/receiving packages via `DatagramSocket` and `DatagramPacket`.
- **Resources**: URL structure parsing.

## 🎨 GUI Development (JavaFX)
- **Graphics Pipeline**: Lifecycle of JavaFX applications, Stage, Scene.
- **Controls & Layouts**: Basic interactive widgets (controls), layout panes (VBox, HBox, Grid, etc.).
- **Interactive Mechanics**: Event handling, transitions, animations, and game loops (interactive game loop simulation).

## 🛢️ Database Connectivity (JDBC & SQL)
- **Database Access**: JDBC architecture, driver registration, connecting to SQLite.
- **Statements & Queries**: Executing statements (`Statement`), parameterized query protection (`PreparedStatement`), and consuming query results (`ResultSet`).
- **Relational Databases (SQL)**: SELECT queries, filtering (`WHERE`), joins (`JOIN`), ordering (`ORDER BY`), and transaction safety.
