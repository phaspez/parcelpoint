block_constrain = """
    -- Function to calculate total volume of a package
    CREATE OR REPLACE FUNCTION calculate_package_volume(w float, h float, l float)
    RETURNS float AS $$
    BEGIN
        RETURN w * h * l;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Function to verify storage block capacity
    CREATE OR REPLACE FUNCTION verify_storage_block_capacity()
    RETURNS TRIGGER AS $$
    DECLARE
        block_max_weight float;
        block_max_size float;
        total_weight float;
        total_size float;
        new_package_volume float;
    BEGIN
        -- If block_id is null, skip validation
        IF NEW.block_id IS NULL THEN
            RETURN NEW;
        END IF;
    
        -- Get storage block capacity limits
        SELECT max_weight, max_size
        INTO block_max_weight, block_max_size
        FROM storageblock
        WHERE id = NEW.block_id;
    
        -- Calculate new package volume
        new_package_volume := calculate_package_volume(NEW.width, NEW.height, NEW.length);
    
        -- Calculate total weight and size for the block, excluding the current package if it's an update
        SELECT
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(calculate_package_volume(width, height, length)), 0)
        INTO total_weight, total_size
        FROM package
        WHERE block_id = NEW.block_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
        -- Add new package weight and volume
        total_weight := total_weight + NEW.weight;
        total_size := total_size + new_package_volume;
    
        -- Check if new totals exceed capacity
        IF total_weight > block_max_weight THEN
            RAISE EXCEPTION 'Cannot add package. Total weight (%) exceeds block capacity (%)',
                total_weight, block_max_weight;
        END IF;
    
        IF total_size > block_max_size THEN
            RAISE EXCEPTION 'Cannot add package. Total size (%) exceeds block capacity (%)',
                total_size, block_max_size;
        END IF;
    
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create trigger for insert and update operations
    CREATE TRIGGER enforce_block_capacity
        BEFORE INSERT OR UPDATE ON package
        FOR EACH ROW
        EXECUTE FUNCTION verify_storage_block_capacity();
"""
