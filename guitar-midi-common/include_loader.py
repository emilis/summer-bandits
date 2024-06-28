import os
from SCons.Script import Import

Import("env")

common_lib_path = "../guitar-midi-common"

# Path to the external include and source directory
external_include_dir = os.path.abspath(common_lib_path)
external_source_dir = os.path.abspath(common_lib_path)

env.Append(CPPPATH=[external_include_dir])
env.BuildSources(
    os.path.join("$BUILD_DIR", "external_src"),
    external_source_dir
)
