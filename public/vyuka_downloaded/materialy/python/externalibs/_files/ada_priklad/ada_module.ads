-- file: ada_module.ads

package Ada_Module is

   procedure Say_Hello;
   pragma Export (C, Say_Hello, "say_hello");

end Ada_Module;
