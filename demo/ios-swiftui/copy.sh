if [ ! -d "../../resources/porcupine/resources/keyword_files/ios" ]
then 
    echo "Porcupine folder not found. Ensure you clone Picovoice repo with submodules."
	echo "Use 'git clone --recurse-submodules'"
	exit 1
fi

if [ ! -d "../../resources/rhino/resources/contexts/ios/" ]
then 
    echo "Rhino folder not found. Ensure you clone Picovoice repo with submodules."
	echo "Use 'git clone --recurse-submodules'"
	exit 1
fi

echo "Copying keyword and context files..."
cp ../../resources/porcupine/resources/keyword_files/ios/hey\ barista_ios.ppn ./BaristaDemo/Resources/hey\ barista_ios.ppn
cp ../../resources/rhino/resources/contexts/ios/coffee_maker_ios.rhn ./BaristaDemo/Resources/coffee_maker_ios.rhn
echo "Copy complete!"