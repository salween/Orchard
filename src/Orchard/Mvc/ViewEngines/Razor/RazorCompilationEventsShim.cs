﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Web.WebPages.Razor;
using Orchard.Environment;
using Orchard.Environment.Extensions.Loaders;
using Orchard.FileSystems.Dependencies;

namespace Orchard.Mvc.ViewEngines.Razor {
    public class RazorCompilationEventsShim : IShim {
        private static int _initialized;
        private IOrchardHostContainer _hostContainer;
        private static RazorCompilationEventsShim _instance;

        private RazorCompilationEventsShim() {
            RazorBuildProvider.CodeGenerationStarted += new EventHandler(RazorBuildProvider_CodeGenerationStarted);
            OrchardHostContainerRegistry.RegisterShim(this);
        }

        void RazorBuildProvider_CodeGenerationStarted(object sender, EventArgs e) {
            var provider = (RazorBuildProvider)sender;

            var descriptors = DependenciesFolder.LoadDescriptors();
            var entries = descriptors
                .SelectMany(descriptor => Loaders
                    .Where(loader => descriptor.LoaderName == loader.Name)
                    .Select(loader => new { 
                        loader,
                        descriptor, 
                        directive = loader.GetWebFormAssemblyDirective(descriptor),
                        dependencies = loader.GetWebFormVirtualDependencies(descriptor)
                    }));

            foreach (var entry in entries) {
                if (entry.directive != null) {
                    if (entry.directive.StartsWith("<%@ Assembly Name=\"")) {
                        var assembly = AssemblyLoader.Load(entry.descriptor.Name);
                        if (assembly != null)
                            provider.AssemblyBuilder.AddAssemblyReference();
                    }
                    else if (entry.directive.StartsWith("<%@ Assembly Src=\"")) {
                        // Returned assembly may be null if the .csproj file doesn't containt any .cs file, for example
                        var assembly = BuildManager.GetCompiledAssembly(entry.descriptor.VirtualPath);
                        if (assembly != null)
                            provider.AssemblyBuilder.AddAssemblyReference(assembly);
                    }
                }
                foreach (var virtualDependency in entry.dependencies) {
                    provider.AddVirtualPathDependency(virtualDependency);
                }
            }
        }


        public IOrchardHostContainer HostContainer {
            get { return _hostContainer; }
            set {
                _hostContainer = value;
                BuildManager = _hostContainer.Resolve<IBuildManager>();
                AssemblyLoader = _hostContainer.Resolve<IAssemblyLoader>();
                DependenciesFolder = _hostContainer.Resolve<IDependenciesFolder>();
                Loaders = _hostContainer.Resolve<IEnumerable<IExtensionLoader>>();
            }
        }

        public IBuildManager BuildManager { get; set; }
        public IAssemblyLoader AssemblyLoader { get; set; }
        public IDependenciesFolder DependenciesFolder { get; set; }
        public IEnumerable<IExtensionLoader> Loaders { get; set; }



        public static void EnsureInitialized() {
            var uninitialized = Interlocked.CompareExchange(ref _initialized, 1, 0) == 0;
            if (uninitialized)
                _instance = new RazorCompilationEventsShim();
        }
    }
}
